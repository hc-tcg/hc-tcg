import {GameModel} from 'common/models/game-model'
import {discardSingleUse} from 'common/utils/movement'

function* removeEffectSaga(game: GameModel, turnAction: any, actionState: any) {
	const {currentPlayer} = game
	const {pastTurnActions} = actionState

	if (currentPlayer.board.singleUseCardUsed) return 'INVALID'

	// ideally we should not modify history, but this in this case it should be okay
	const sueIndex = pastTurnActions.findIndex((value: string) => value === 'PLAY_SINGLE_USE_CARD')
	if (sueIndex !== -1) pastTurnActions.splice(sueIndex, 1)

	discardSingleUse(game, currentPlayer)
	return 'DONE'
}

export default removeEffectSaga
