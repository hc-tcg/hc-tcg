import {GameModel} from 'common/models/game-model'
import {applySingleUse} from 'common/utils/board'

function* applyEffectSaga(game: GameModel, turnAction: any, actionState: any) {
	const {pickedSlots, modalResult} = actionState

	const result = applySingleUse(game, pickedSlots, modalResult)
	if (!result) return 'INVALID'
}

export default applyEffectSaga
