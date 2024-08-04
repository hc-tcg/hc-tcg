import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel} from 'common/models/game-model'
import {AnyAction} from 'redux-saga'
import {takeEvery} from 'typed-redux-saga'

function* spectatorLeaveSaga(game: GameModel, action: AnyAction) {
	let viewer = game.components.find(
		ViewerComponent,
		(_game, component) => component.playerId === action.id,
	)
	if (viewer) game.components.delete(viewer.entity)
}

function* spectatorSaga(game: GameModel) {
	yield takeEvery('SPECTATOR_LEAVE', spectatorLeaveSaga, game)
}

export default spectatorSaga
