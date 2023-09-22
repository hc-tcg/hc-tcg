import {GameModel} from 'common/models/game-model'
import {GenericActionResult} from 'common/types/game-state'
import {PickedSlots} from 'common/types/pick-process'
import {applySingleUse} from 'common/utils/board'

function* applyEffectSaga(
	game: GameModel,
	pickedSlots: PickedSlots
): Generator<never, GenericActionResult> {
	const result = applySingleUse(game, pickedSlots)

	return result
}

export default applyEffectSaga
