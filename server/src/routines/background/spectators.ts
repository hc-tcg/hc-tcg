import {GameModel} from 'common/models/game-model'
import {AnyAction} from 'redux-saga'
import {takeEvery} from 'typed-redux-saga'

function* spectatorLeaveSaga(game: GameModel, action: AnyAction) {
	game.components.delete(action.id)
}

function* spectatorSaga(game: GameModel) {
	yield takeEvery('SPECTATOR_LEAVE', spectatorLeaveSaga, game)
}

export default spectatorSaga
