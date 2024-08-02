import {PlayerComponent, SlotComponent} from "common/components"
import query from "common/components/query"
import {SlotEntity} from "common/entities"
import {GameModel} from "common/models/game-model"
import {AttackActionData, attackToAttackAction} from "common/types/action-data"
import {ActionResult} from "common/types/game-state"
import {call} from "typed-redux-saga"
import attackSaga from "./attack"

function* pickRequestSaga(
	game: GameModel,
	pickResult?: SlotEntity,
): Generator<any, ActionResult> {
	// First validate data sent from client
	if (!pickResult || !pickResult) return "FAILURE_INVALID_DATA"

	// Find the current pick request
	const pickRequest = game.state.pickRequests[0]
	if (!pickRequest) {
		// There's no pick request active.
		console.log(
			"Client sent pick result without request! Pick info:",
			pickResult,
		)
		return "FAILURE_NOT_APPLICABLE"
	}

	// Call the bound function with the pick result
	let slotInfo = game.components.find(
		SlotComponent,
		query.slot.entity(pickResult),
	)
	if (!slotInfo) return "FAILURE_INVALID_DATA"

	const canPick = pickRequest.canPick(game, slotInfo)

	if (!canPick) {
		return "FAILURE_INVALID_SLOT"
	}

	const card = slotInfo.getCard()

	// Because Worm Man, all cards need to be flipped over to normal once they're picked
	if (card) card.turnedOver = false

	pickRequest.onResult(slotInfo)
	let player = game.components.find(
		PlayerComponent,
		(_game, player) => player.id === pickRequest.playerId,
	)
	if (player) player.pickableSlots = null

	// We completed this pick request, remove it
	game.state.pickRequests.shift()

	if (!game.hasActiveRequests() && game.state.turn.currentAttack) {
		// There are no active requests left, and we're in the middle of an attack. Execute it now.
		const turnAction: AttackActionData = {
			type: attackToAttackAction[game.state.turn.currentAttack],
			payload: {
				playerId: game.currentPlayer.id,
			},
		}
		const attackResult = yield* call(attackSaga, game, turnAction, false)

		game.state.turn.currentAttack = null

		return attackResult
	}

	return "SUCCESS"
}

export default pickRequestSaga
