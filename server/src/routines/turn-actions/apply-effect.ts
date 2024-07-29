import {GameModel} from 'common/models/game-model'
import {GenericActionResult} from 'common/types/game-state'
import {applySingleUse} from 'common/utils/board'

function* applyEffectSaga(game: GameModel): Generator<any, GenericActionResult> {
	const result = applySingleUse(game, null)
	return result
}

export default applyEffectSaga
