import {attackToAttackAction} from 'common/types/turn-action-data'
import {getPlayerState} from 'logic/game/game-selectors'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {put} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
// TODO - get rid of app game-selectors
import {
	getOpponentActiveRow,
	getPlayerActiveRow,
} from '../../../app/game/game-selectors'

export function* attackSaga(
	action: LocalMessageTable[typeof localMessages.GAME_ACTIONS_ATTACK],
): SagaIterator {
	const {attackType} = action
	const actionType = attackToAttackAction[attackType]

	const player = yield* select(getPlayerState)
	const activeRow = yield* select(getPlayerActiveRow)
	const opponentActiveRow = yield* select(getOpponentActiveRow)
	if (!player || !activeRow || !activeRow.hermit) return
	if (!opponentActiveRow || !opponentActiveRow.hermit) return

	yield put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		action: {
			type: actionType,
		},
	})
}

export default attackSaga
