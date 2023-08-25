import {GameModel} from 'common/models/game-model'
import {GenericActionResult} from 'common/types/game-state'
import {PickedSlots} from 'common/types/pick-process'
import {applySingleUse} from 'common/utils/board'

function* applyEffectSaga(
	game: GameModel,
	pickedSlots: PickedSlots,
	modalResult: any
): Generator<never, GenericActionResult> {
	const result = applySingleUse(game, pickedSlots, modalResult)

	return result
}

export default applyEffectSaga
