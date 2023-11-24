import {GameModel} from 'common/models/game-model'
import {ActionResult} from 'common/types/game-state'
import {PickInfo} from 'common/types/server-requests'
import attackSaga from './attack'
import {call} from 'typed-redux-saga'
import {AttackActionData, attackToAttackAction} from 'common/types/action-data'

function* pickRequestSaga(game: GameModel, pickResult?: PickInfo): Generator<any, ActionResult> {
	// First validate data sent from client
	if (!pickResult || !pickResult.playerId) return 'FAILURE_INVALID_DATA'
	if (!pickResult.slot || pickResult.slot.index === undefined || !pickResult.slot.type)
		return 'FAILURE_INVALID_DATA'

	// Find the current pick request
	const pickRequest = game.state.pickRequests[0]
	if (!pickRequest) {
		// There's no pick request active.
		console.log('Client sent pick result without request! Pick info:', pickResult)
		return 'FAILURE_NOT_APPLICABLE'
	}

	// Call the bound function with the pick result
	const result = pickRequest.onResult(pickResult)

	if (result === 'SUCCESS') {
		// We completed this pick request, remove it
		game.state.pickRequests.shift()

		if (!game.hasActiveRequests() && game.state.turn.currentAttack) {
			// There are no active requests left, and we're in the middle of an attack. Execute it now.
			const turnAction: AttackActionData = {
				type: attackToAttackAction[game.state.turn.currentAttack],
				payload: {
					playerId: game.currentPlayerId,
				},
			}
			const attackResult = yield* call(attackSaga, game, turnAction, false)

			game.state.turn.currentAttack = null

			return attackResult
		}
	}

	return result
}

export default pickRequestSaga
