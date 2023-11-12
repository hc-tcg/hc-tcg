import {GameModel} from 'common/models/game-model'
import {AttackActionData, attackToAttackAction} from 'common/types/action-data'
import {ActionResult} from 'common/types/game-state'
import {call} from 'typed-redux-saga'
import attackSaga from './attack'

function* modalRequestSaga(game: GameModel, modalResult: any): Generator<any, ActionResult> {
	const modalRequest = game.state.modalRequests[0]
	if (!modalRequest) {
		console.log('Client sent modal result without request! Result:', modalResult)
		return 'FAILURE_NOT_APPLICABLE'
	}

	// Call the bound function with the pick result
	const result = modalRequest.onResult(modalResult)

	if (result === 'SUCCESS') {
		// We completed the modal request, remove it
		game.state.modalRequests.shift()

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

export default modalRequestSaga
