import {GameModel} from 'common/models/game-model'
import {GenericActionResult} from 'common/types/game-state'
import {discardSingleUse} from 'common/utils/movement'

function* removeEffectSaga(game: GameModel): Generator<never, GenericActionResult> {
	const {currentPlayer} = game

	if (!currentPlayer.board.singleUseCard) {
		return 'FAILURE_NOT_APPLICABLE'
	}

	if (currentPlayer.board.singleUseCardUsed) {
		return 'FAILURE_CANNOT_COMPLETE'
	}

	if (currentPlayer.pickRequests.length >= 0) {
		// Cancel and clear pick requests
		for (let i = 0; i < currentPlayer.pickRequests.length; i++) {
			currentPlayer.pickRequests[i].onCancel?.()
		}
		currentPlayer.pickRequests = []
	}

	discardSingleUse(game, currentPlayer)

	return 'SUCCESS'
}

export default removeEffectSaga
