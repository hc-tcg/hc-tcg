import {CARDS, HERMIT_CARDS} from 'common/cards'
import {GameModel} from 'common/models/game-model'
import {equalCard} from 'common/utils/cards'
import {PlayCardActionData} from 'common/types/action-data'
import {CardPosModel} from 'common/models/card-pos-model'
import {ActionResult} from 'common/types/game-state'
import {DEBUG_CONFIG} from 'common/config'
import {callSlotConditionWithPickInfo} from 'common/slot'
import {SlotInfo} from 'common/types/cards'

function* playCardSaga(
	game: GameModel,
	turnAction: PlayCardActionData
): Generator<any, ActionResult> {
	// Make sure data sent from client is correct
	const pickInfo = turnAction?.payload?.pickInfo
	const card = turnAction?.payload?.card
	if (!pickInfo || !card || !pickInfo.playerId || !pickInfo) {
		return 'FAILURE_INVALID_DATA'
	}

	const {currentPlayer} = game

	const {playerId, rowIndex: pickedIndex, type, index} = pickInfo

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
	if (type === 'health' || type === 'hand') {
		return 'FAILURE_INVALID_SLOT'
	}

	const row = pickedIndex !== null ? player.board.rows[pickedIndex] : null
	const rowIndex = pickedIndex === null ? null : pickedIndex
	const opponentPlayer = game.state.players[opponentPlayerId]

	// Do we meet requirements to place the card
	const canAttach = callSlotConditionWithPickInfo(cardInfo.attachCondition, game, pickInfo)

	// It's the wrong kind of slot or does not satisfy the condition
	if (!canAttach) return 'FAILURE_INVALID_SLOT'

	// Finally, execute depending on where we tried to place
	// And set the action result to be sent to the client

	// Single use slot
	if (type === 'single_use') {
		player.board.singleUseCard = card
	} else {
		// All other positions requires us to have selected a valid row
		if (!row || rowIndex === null) return 'FAILURE_CANNOT_COMPLETE'

		switch (type) {
			case 'hermit': {
				player.hasPlacedHermit = true
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
				if (index === null) break
				row.itemCards[index] = card
				break
			}
			case 'effect': {
				row.effectCard = card
				break
			}
			default:
				throw new Error('Unknown slot type when trying to play a card: ' + pickInfo.type)
		}
	}

	const slotInfo: SlotInfo = {
		player,
		opponentPlayer,
		row,
		rowIndex,
		type,
		index,
		card,
	}
	const pos = new CardPosModel(game, slotInfo, card.cardInstance)

	// Remove the card from the hand
	if (!DEBUG_CONFIG.unlimitedCards) {
		currentPlayer.hand = currentPlayer.hand.filter((handCard) => !equalCard(handCard, card))
	}

	// Add entry to battle log, unless it is played in a single use slot
	if (pickInfo.type !== 'single_use') {
		game.battleLog.addPlayCardEntry(cardInfo, pos, currentPlayer.coinFlips, undefined)
	}

	cardInfo.onAttach(game, card.cardInstance, pos)

	// Call onAttach hook
	currentPlayer.hooks.onAttach.call(card.cardInstance)

	return 'SUCCESS'
}

export default playCardSaga
