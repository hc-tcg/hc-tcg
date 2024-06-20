import {GameModel} from 'common/models/game-model'
import {ActionResult, CardT, PlayerState} from 'common/types/game-state'
import {DeselectCard, RequestPlayableSlotsData} from 'common/types/action-data'
import {CARDS} from 'common/cards'
import {PickedSlotType, SlotDisplayPosition} from 'common/types/server-requests'

export function* playableSlotsRequestSaga(
	game: GameModel,
	payload: RequestPlayableSlotsData["payload"]
): Generator<any, ActionResult> {
	const playerState = game.state.players[payload.playerId]

	let card = payload.card
	let cardObj = CARDS[card.cardId]

	playerState.pickableSlots = game.getPickableSlots(cardObj.attachCondition)

	return 'SUCCESS'
}

export function* deselectCardSaga(
	game: GameModel,
	payload: DeselectCard["payload"]
): Generator<any, ActionResult> {
	const playerState = game.state.players[payload.playerId]
	playerState.pickableSlots = null
	return 'SUCCESS'
}
