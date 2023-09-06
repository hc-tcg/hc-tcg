import {GameModel} from 'common/models/game-model'
import {ActionResult} from 'common/types/game-state'

function* customModalSaga(game: GameModel, modalResult: any): Generator<never, ActionResult> {
	const {currentPlayer} = game

	const {modalRequests} = currentPlayer
	if (!modalRequests[0]) {
		console.log('Client sent modal result without request! Result:', modalResult)
		return 'FAILURE_NOT_APPLICABLE'
	}

	// Call the bound function with the pick result
	const result = modalRequests[0].onResult(modalResult)

	if (result === 'SUCCESS') {
		// We completed the modal request, remove it
		currentPlayer.modalRequests.shift()
	}

	return result
}

export default customModalSaga
