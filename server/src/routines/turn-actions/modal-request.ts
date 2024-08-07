import {GameModel} from 'common/models/game-model'
import {
	AttackActionData,
	attackToAttackAction,
} from 'common/types/turn-action-data'
import {ActionResult} from 'common/types/game-state'
import {CopyAttack, SelectCards} from 'common/types/modal-requests'
import {LocalCopyAttack, LocalSelectCards} from 'common/types/server-requests'
import {call} from 'typed-redux-saga'
import attackSaga from './attack'

function* modalRequestSaga(
	game: GameModel,
	modalResult: LocalSelectCards.Result | LocalCopyAttack.Result,
): Generator<any, ActionResult> {
	const modalRequest = game.state.modalRequests[0]
	if (!modalRequest) {
		console.log(
			'Client sent modal result without request! Result:',
			modalResult,
		)
		return 'FAILURE_NOT_APPLICABLE'
	}

	// Call the bound function with the pick result
	let result: ActionResult = 'FAILURE_INVALID_DATA'
	if (modalRequest.data.modalId === 'selectCards') {
		let modalRequest_ = modalRequest as SelectCards.Request
		let modal = modalResult as LocalSelectCards.Result
		result = modalRequest_.onResult({
			...modal,
			cards: modal.cards
				? modal.cards.map((entity) => game.components.get(entity)!)
				: null,
		} as SelectCards.Result)
	} else if (modalRequest.data.modalId === 'copyAttack') {
		let modalRequest_ = modalRequest as CopyAttack.Request
		let modal = modalResult as CopyAttack.Result
		result = modalRequest_.onResult(modal)
	} else throw Error('Unknown modal type')

	if (result === 'SUCCESS') {
		// We completed the modal request, remove it
		game.state.modalRequests.shift()

		if (!game.hasActiveRequests() && game.state.turn.currentAttack) {
			// There are no active requests left, and we're in the middle of an attack. Execute it now.
			const turnAction: AttackActionData = {
				type: attackToAttackAction[game.state.turn.currentAttack],
				player: game.currentPlayer.entity,
			}
			const attackResult = yield* call(attackSaga, game, turnAction, false)

			game.state.turn.currentAttack = null

			return attackResult
		}
	}

	return result
}

export default modalRequestSaga
