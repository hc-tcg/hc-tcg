import {SagaIterator} from 'redux-saga'
import {CARDS, HERMIT_CARDS} from 'common/cards'
import {GameModel} from 'common/models/game-model'
import {PickedSlotT} from 'common/types/pick-process'
import {equalCard} from 'common/utils/cards'
import {BasicCardPos, CardPosModel} from 'common/models/card-pos-model'
import {CardT} from 'common/types/game-state'

function* playCardSaga(game: GameModel, turnAction: any, actionState: any): SagaIterator {
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer} = game
	const {pastTurnActions, availableActions} = actionState

	const card: CardT = turnAction.payload.card
	const pickedSlot: PickedSlotT = turnAction.payload.pickedSlot

	const cardInfo = CARDS[card.cardId]
	const opponentPlayerId = game.getPlayerIds().find((id) => id !== pickedSlot.playerId)
	if (!opponentPlayerId) return

	if (pickedSlot.slot.type === 'health' || pickedSlot.slot.type === 'hand') return
	if (!currentPlayer.hand.find((handCard) => equalCard(handCard, card))) return

	// We can't automatically get the card pos, as the card is not on the board yet
	const basicPos: BasicCardPos = {
		player: game.state.players[pickedSlot.playerId],
		opponentPlayer: game.state.players[opponentPlayerId],
		rowIndex: pickedSlot.row ? pickedSlot.row.index : null,
		row: pickedSlot.row
			? game.state.players[pickedSlot.playerId].board.rows[pickedSlot.row.index]
			: null,
		slot: {type: pickedSlot.slot.type, index: pickedSlot.slot.index},
	}

	const pos = new CardPosModel(game, basicPos, card.cardInstance, true)

	// Can't attach if card is already there
	if (pos.card !== null) return

	// Do we meet requirements of card
	const canAttach = cardInfo.canAttach(game, pos)

	// This is a bit confusing, but it's clearer for the method for INVALID to mean the slot is completely invalid

	// Do nothing if it's the wrong kind of slot
	if (canAttach === 'INVALID') return
	// If it's the right kind of slot, but we can't attach, return invalid
	if (canAttach === 'NO') return 'INVALID'

	const player = game.state.players[pickedSlot.playerId]
	if (!player) return 'INVALID'

	if (pos.slot.type === 'hermit' && pickedSlot.row) {
		if (!availableActions.includes('ADD_HERMIT')) return
		const row = player.board.rows[pickedSlot.row.index]
		row.hermitCard = card
		if (player.board.activeRow === null) {
			player.board.activeRow = pickedSlot.row.index
		}
		pastTurnActions.push('ADD_HERMIT')

		if (cardInfo.type === 'hermit') {
			row.health = HERMIT_CARDS[cardInfo.id].health
		}
	} else if (pickedSlot.slot.type === 'item') {
		const isItem = cardInfo.type === 'item'
		if (isItem && !availableActions.includes('PLAY_ITEM_CARD')) return
		if (!isItem && !availableActions.includes('PLAY_EFFECT_CARD')) return
		const hermitRow = player.board.rows.find((row) =>
			equalCard(row.hermitCard, pickedSlot.row?.state.hermitCard || null)
		)
		if (!hermitRow) return

		hermitRow.itemCards[pickedSlot.slot.index] = card

		pastTurnActions.push(isItem ? 'PLAY_ITEM_CARD' : 'PLAY_EFFECT_CARD')
	} else if (pickedSlot.slot.type === 'effect') {
		if (!availableActions.includes('PLAY_EFFECT_CARD')) return
		const hermitRow = player.board.rows.find((row) =>
			equalCard(row.hermitCard, pickedSlot.row?.state.hermitCard || null)
		)
		if (!hermitRow) return

		hermitRow.effectCard = card
		pastTurnActions.push('PLAY_EFFECT_CARD')
	} else if (pickedSlot.slot.type === 'single_use') {
		if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) return

		player.board.singleUseCard = card
		pastTurnActions.push('PLAY_SINGLE_USE_CARD')
	}

	currentPlayer.hand = currentPlayer.hand.filter((handCard) => !equalCard(handCard, card))

	// Now it's actually been attached, remove the abstract mark on the card pos
	pos.abstract = false

	cardInfo.onAttach(game, card.cardInstance, pos)

	// Call onAttach hook
	currentPlayer.hooks.onAttach.call(card.cardInstance)

	return 'DONE'
}

export default playCardSaga
