import {GameModel} from 'common/models/game-model'
import {GenericActionResult} from 'common/types/game-state'
import {applySingleUse} from 'common/utils/board'
import {call} from 'typed-redux-saga'

function* applyEffectSaga(game: GameModel): Generator<any, GenericActionResult> {
	const result = applySingleUse(game)

	return result
}

export default applyEffectSaga
