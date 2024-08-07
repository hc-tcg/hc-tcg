import {SlotComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {ChangeActiveHermitActionData} from 'common/types/turn-action-data'
import {GenericActionResult} from 'common/types/game-state'

function* changeActiveHermit(
	game: GameModel,
	turnAction: ChangeActiveHermitActionData,
): Generator<any, GenericActionResult> {
	const {currentPlayer} = game

	// Find the row we are trying to change to
	const pickedSlot = game.components.find(
		SlotComponent,
		query.slot.entity(turnAction?.entity),
	)
	if (!pickedSlot?.onBoard()) return 'FAILURE_INVALID_DATA'
	const row = pickedSlot.row
	if (!row) return 'FAILURE_INVALID_DATA'

	const hadActiveHermit = currentPlayer.activeRowEntity !== null

	// Change row
	const result = currentPlayer.changeActiveRow(row)
	if (!result) return 'FAILURE_CANNOT_COMPLETE'

	if (hadActiveHermit) {
		// We switched from one hermit to another, mark this action as completed
		game.addCompletedActions('CHANGE_ACTIVE_HERMIT')

		// Attack phase complete, mark most actions as blocked now
		game.addBlockedActions(
			'game',
			'SINGLE_USE_ATTACK',
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'PLAY_HERMIT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_SINGLE_USE_CARD',
		)
	}

	return 'SUCCESS'
}

export default changeActiveHermit
