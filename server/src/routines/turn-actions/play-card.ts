import {CARDS, HERMIT_CARDS} from 'common/cards'
import {GameModel} from 'common/models/game-model'
import {equalCard} from 'common/utils/cards'
import {PlayCardActionData} from 'common/types/action-data'
import {BasicCardPos, CardPosModel} from 'common/models/card-pos-model'
import {ActionResult} from 'common/types/game-state'
import {call} from 'typed-redux-saga'
import {DEBUG_CONFIG} from 'common/config'

function* playCardSaga(
	game: GameModel,
	turnAction: PlayCardActionData
): Generator<any, ActionResult> {
	// Make sure data sent from client is correct
	const pickInfo = turnAction?.payload?.pickInfo
	const card = turnAction?.payload?.card
	if (!pickInfo || !card || !pickInfo.playerId || !pickInfo.slot) {
		return 'FAILURE_INVALID_DATA'
	}

	const {currentPlayer} = game

	const {playerId, rowIndex: pickedIndex, slot: pickedSlot} = pickInfo

	const cardInfo = CARDS[card.cardId]
	// opponentPlayerId is relative to where the card is being placed
	const opponentPlayerId = playerId === currentPlayer.id ? game.opponentPlayerId : currentPlayer.id

	// Card must be in hand to play it
	if (!currentPlayer.hand.find((handCard) => equalCard(handCard, card))) {
		return 'FAILURE_INVALID_DATA'
	}

	const player = game.state.players[playerId]
	if (!player) {
		return 'FAILURE_INVALID_DATA'
	}

	// Can't attach to hand or health slot
	if (pickedSlot.type === 'health' || pickedSlot.type === 'hand') {
		return 'FAILURE_INVALID_SLOT'
	}

	// We can't automatically get the card pos, as the card is not on the board yet
	const basicPos: BasicCardPos = {
		player,
		opponentPlayer: game.state.players[opponentPlayerId],
		rowIndex: pickedIndex === undefined ? null : pickedIndex,
		row: pickedIndex !== undefined ? player.board.rows[pickedIndex] : null,
		slot: {type: pickedSlot.type, index: pickedSlot.index},
	}

	const pos = new CardPosModel(game, basicPos, card.cardInstance, true)

	// Can't attach if card is already there
	if (pos.card !== null) return 'FAILURE_CANNOT_COMPLETE'
	const {row, rowIndex, slot} = pos

	// Do we meet requirements to place the card
	const canAttach = cardInfo.canAttach(game, pos)
	player.hooks.canAttach.call(canAttach, pos)

	// It's the wrong kind of slot
	if (canAttach.includes('INVALID_PLAYER')) return 'FAILURE_INVALID_PLAYER'
	if (canAttach.includes('INVALID_SLOT')) return 'FAILURE_INVALID_SLOT'
	// If it's the right kind of slot, but we can't attach
	if (canAttach.includes('UNMET_CONDITION_SILENT')) return 'FAILURE_UNMET_CONDITION_SILENT'
	if (canAttach.includes('UNMET_CONDITION')) return 'FAILURE_UNMET_CONDITION'

	if (canAttach.includes('UNKNOWN_ERROR')) return 'FAILURE_UNKNOWN_ERROR'

	// Finally, execute depending on where we tried to place
	// And set the action result to be sent to the client

	// Single use slot
	if (pickedSlot.type === 'single_use') {
		player.board.singleUseCard = card
	} else {
		// All other positions requires us to have selected a valid row
		if (!row || rowIndex === null) return 'FAILURE_CANNOT_COMPLETE'

		switch (slot.type) {
			case 'hermit': {
				row.hermitCard = card

				// If the card is not a hermit card it will have to set the row health itself
				const hermitCardInfo = HERMIT_CARDS[cardInfo.id]
				if (hermitCardInfo) {
					row.health = HERMIT_CARDS[cardInfo.id].health
				}

				if (player.board.activeRow === null) {
					game.changeActiveRow(player, rowIndex)
				}

				break
			}
			case 'item': {
				row.itemCards[slot.index] = card

				// This can only be done once per turn
				game.addCompletedActions('PLAY_ITEM_CARD')

				break
			}
			case 'effect': {
				row.effectCard = card
				break
			}
			default:
				throw new Error('Unknown slot type when trying to play a card: ' + slot.type)
		}
	}

	// Remove the card from the hand
	if (!DEBUG_CONFIG.unlimitedCards)
		currentPlayer.hand = currentPlayer.hand.filter((handCard) => !equalCard(handCard, card))

	// Now it's actually been attached, remove the fake mark on the card pos
	pos.fake = false

	// Add entry to battle log, unless it is played in a single use slot
	if (pos.slot.type !== 'single_use') {
		game.battleLog.addPlayCardEntry(cardInfo, pos, currentPlayer.coinFlips, undefined)
	}

	cardInfo.onAttach(game, card.cardInstance, pos)

	// Call onAttach hook
	currentPlayer.hooks.onAttach.call(card.cardInstance)

	return 'SUCCESS'
}

export default playCardSaga
