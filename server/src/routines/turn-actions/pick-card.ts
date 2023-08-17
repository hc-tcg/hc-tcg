import {GameModel} from 'common/models/game-model'
import {ActionResult} from 'common/types/game-state'
import {PickResult} from 'common/types/server-requests'

function* pickCardSaga(game: GameModel, pickResult?: PickResult): Generator<never, ActionResult> {
	// First validate data sent from client
	if (!pickResult || !pickResult.playerId) return 'FAILURE_INVALID_DATA'
	if (!pickResult.slot || pickResult.slot.index === undefined || !pickResult.slot.type)
		return 'FAILURE_INVALID_DATA'
	const {currentPlayer, opponentPlayer} = game

	// Find the current pick request

	// Check current player first
	let pickRequest = currentPlayer.pickRequests[0]
	let playerWithRequest = currentPlayer
	if (!pickRequest) {
		// Current player has no active pick request, check the opponent player
		playerWithRequest = opponentPlayer

		pickRequest = opponentPlayer.pickRequests[0]
		if (!pickRequest) {
			// There's no pick request at all! What is the client doing?
			console.log('Client sent pick result without request! Pick info:', pickResult)
			return 'FAILURE_NOT_APPLICABLE'
		}
	}

	// Call the bound function with the pick result
	const result = pickRequest.onResult(pickResult)

	if (result === 'SUCCESS') {
		// We completed this pick request, remove it
		playerWithRequest.pickRequests.shift()
	}

	return result
}

export default pickCardSaga
