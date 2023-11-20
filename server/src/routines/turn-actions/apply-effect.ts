import {GameModel} from 'common/models/game-model'
import {GenericActionResult} from 'common/types/game-state'
import {PickedSlots} from 'common/types/pick-process'
import {applySingleUse} from 'common/utils/board'
import {call} from 'typed-redux-saga'
import {addApplyEffectEntry} from 'utils/battle-log'

function* applyEffectSaga(
	game: GameModel,
	pickedSlots: PickedSlots
): Generator<any, GenericActionResult> {
	const result = applySingleUse(game, pickedSlots)

	// Add entry to battle log
	yield* call(addApplyEffectEntry, game)

	return result
}

export default applyEffectSaga
