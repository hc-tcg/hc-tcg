import CARDS, {HERMIT_CARDS} from '../../../common/cards'
import {GameModel} from '../../models/game-model'
import {equalCard} from '../../utils'
import {getCardAtPos} from '../../utils/cards'

/**
 * @typedef {import("redux-saga").SagaIterator} SagaIterator
 */

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @param {ActionState} actionState
 * @return {SagaIterator}
 */
function* playCardSaga(game, turnAction, actionState) {
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer} = game.ds
	const {pastTurnActions, availableActions} = actionState
	const card = turnAction.payload.card
	/** @type {import('common/types/pick-process').PickedSlotT} */
	const pickedSlot = turnAction.payload.pickedSlot
	const cardInfo = CARDS[card.cardId]
	const opponentPlayerId = game.getPlayerIds().find((id) => id !== pickedSlot.playerId)
	if (!opponentPlayerId) return

	if (pickedSlot.slot.type === 'health' || pickedSlot.slot.type === 'hand') return
	if (!currentPlayer.hand.find((handCard) => equalCard(handCard, card))) return

	// @TODO - PLAY_CARD should probably be using CardPos
	/** @type {import('../../../common/types/cards').CardPos} */
	const pos = {
		player: game.state.players[pickedSlot.playerId],
		opponentPlayer: game.state.players[opponentPlayerId],
		rowIndex: pickedSlot.row ? pickedSlot.row.index : null,
		row: pickedSlot.row
			? game.state.players[pickedSlot.playerId].board.rows[pickedSlot.row.index]
			: null,
		slot: {type: pickedSlot.slot.type, index: pickedSlot.slot.index},
	}

	// Can't attach if card is already there
	if (getCardAtPos(game, pos) !== null) return

	// Do we meet requirements of card
	const canAttach = cardInfo.canAttach(game, pos)

	// This is a bit confusing, but it's clearer for the method for INVALID to mean the slot is completely invalid

	// Do nothing if it's the wrong kind of slot
	if (canAttach === 'INVALID') return
	// If it's the right kind of slot, but we can't attach, return invalid
	if (canAttach === 'NO') return 'INVALID'

	const player = game.state.players[pickedSlot.playerId]
	if (!player) return 'INVALID'

	const validate = (type) => game.hooks.validateCard.get(type)?.call(turnAction, actionState)

	if (pos.slot.type === 'hermit' && pickedSlot.row) {
		if (!availableActions.includes('ADD_HERMIT')) return
		if (validate('hermit') === 'INVALID') return
		const row = player.board.rows[pickedSlot.row.index]
		row.hermitCard = card
		if (cardInfo.type === 'hermit') {
			row.health = HERMIT_CARDS[cardInfo.id].health
			if (player.board.activeRow === null) {
				player.board.activeRow = pickedSlot.row.index
			}
			pastTurnActions.push('ADD_HERMIT')
		}
	} else if (pickedSlot.slot.type === 'item') {
		const isItem = cardInfo.type === 'item'
		if (isItem && !availableActions.includes('PLAY_ITEM_CARD')) return
		if (!isItem && !availableActions.includes('PLAY_EFFECT_CARD')) return
		const hermitRow = player.board.rows.find((row) =>
			equalCard(row.hermitCard, pickedSlot.row?.state.hermitCard || null)
		)
		if (!hermitRow) return
		if (validate('item') === 'INVALID') return

		hermitRow.itemCards[pickedSlot.slot.index] = card

		pastTurnActions.push(isItem ? 'PLAY_ITEM_CARD' : 'PLAY_EFFECT_CARD')
	} else if (pickedSlot.slot.type === 'effect') {
		if (!availableActions.includes('PLAY_EFFECT_CARD')) return
		const hermitRow = player.board.rows.find((row) =>
			equalCard(row.hermitCard, pickedSlot.row?.state.hermitCard || null)
		)
		if (!hermitRow) return
		if (validate('effect') === 'INVALID') return

		hermitRow.effectCard = card
		pastTurnActions.push('PLAY_EFFECT_CARD')
	} else if (pickedSlot.slot.type === 'single_use') {
		if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) return
		if (player.board.singleUseCard) return
		if (validate('single_use') === 'INVALID') return

		player.board.singleUseCard = card
		pastTurnActions.push('PLAY_SINGLE_USE_CARD')
	}

	currentPlayer.hand = currentPlayer.hand.filter((handCard) => !equalCard(handCard, card))

	cardInfo.onAttach(game, card.cardInstance, pos)

	// Call onAttach hook
	const onAttachs = Object.values(currentPlayer.hooks.onAttach)
	for (let i = 0; i < onAttachs.length; i++) {
		onAttachs[i](card.cardInstance)
	}

	return 'DONE'
}

export default playCardSaga
