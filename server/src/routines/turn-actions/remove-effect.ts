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

	if (game.state.pickRequests[0]?.playerId === currentPlayer.id) {
		// Cancel and clear pick requests
		for (let i = 0; i < game.state.pickRequests.length; i++) {
			game.state.pickRequests[i].onCancel?.()
		}
		game.state.pickRequests = []
	}

	discardSingleUse(game, currentPlayer)

	return 'SUCCESS'
}

export default removeEffectSaga
