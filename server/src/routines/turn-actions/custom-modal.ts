import {GameModel} from 'common/models/game-model'
import {ActionResult} from 'common/types/game-state'
import {PickResult} from 'common/types/server-requests'

function* customModalSaga(game: GameModel, modalResult: any): Generator<never, ActionResult> {
	const {currentPlayer} = game

	const {modalRequest} = currentPlayer
	if (!modalRequest) {
		console.log('Client sent modal result without request! Result:', modalResult)
		return 'FAILURE_NOT_APPLICABLE'
	}

	// Call the bound function with the pick result
	const result = modalRequest.onResult(modalResult)

	if (result === 'SUCCESS') {
		// We completed the modal request, remove it
		currentPlayer.modalRequest = null
	}

	return result
}

export default customModalSaga
