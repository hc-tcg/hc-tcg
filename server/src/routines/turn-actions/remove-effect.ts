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

	game.cancelPickRequests()

	// Remove current attack
	if (game.state.turn.currentAttack) {
		game.state.turn.currentAttack = null
	}

	discardSingleUse(game, currentPlayer)

	return 'SUCCESS'
}

export default removeEffectSaga
