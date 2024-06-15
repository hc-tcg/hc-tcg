import {GameModel} from 'common/models/game-model'
import {ActionResult, CardT, PlayerState} from 'common/types/game-state'
import {RequestPlayableSlotsData} from 'common/types/action-data'
import {CARDS} from 'common/cards'
import {PickedSlotType, SlotDisplayPosition} from 'common/types/server-requests'

export function* playableSlotsRequestSaga(
	game: GameModel,
	payload: RequestPlayableSlotsData
): Generator<any, ActionResult> {
	const playerState = game.state.players[game.currentPlayer.id]

	let card = payload.payload.card
	let cardObj = CARDS[card.cardId]

	playerState.pickableSlots = game.getPickableSlots(cardObj.canBeAttachedTo)

	return 'SUCCESS'
}

export function* deselectCardSaga(game: GameModel): Generator<any, ActionResult> {
	const playerState = game.state.players[game.currentPlayer.id]
	playerState.pickableSlots = null
	return 'SUCCESS'
}
