import {GameModel} from 'common/models/game-model'
import {ActionResult} from 'common/types/game-state'
import {PickResult} from 'common/types/server-requests'

function* pickRequestSaga(
	game: GameModel,
	pickResult?: PickResult
): Generator<never, ActionResult> {
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
	}

	return result
}

export default pickRequestSaga
