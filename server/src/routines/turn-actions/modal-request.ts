import {GameModel} from 'common/models/game-model'
import {ActionResult} from 'common/types/game-state'

function* modalRequestSaga(game: GameModel, modalResult: any): Generator<never, ActionResult> {
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
	}

	return result
}

export default modalRequestSaga
