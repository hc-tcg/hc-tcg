import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils'

function* applyEffectSaga(game: GameModel, turnAction: any, actionState: any) {
	const {pickedSlots, modalResult} = actionState

	const result = applySingleUse(game, pickedSlots, modalResult)
	if (!result) return 'INVALID'
}

export default applyEffectSaga
