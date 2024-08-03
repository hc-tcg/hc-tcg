import {AttackActionData, attackToAttackAction} from 'common/types/action-data'
import {getPlayerState} from 'logic/game/game-selectors'
import {SagaIterator} from 'redux-saga'
import {put} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
// TODO - get rid of app game-selectors
import {
	getOpponentActiveRow,
	getPlayerActiveRow,
} from '../../../app/game/game-selectors'
import {startAttack} from '../game-actions'

type AttackAction = ReturnType<typeof startAttack>

export function* attackSaga(action: AttackAction): SagaIterator {
	const {type} = action.payload
	const actionType = attackToAttackAction[type]

	const player = yield* select(getPlayerState)
	const activeRow = yield* select(getPlayerActiveRow)
	const opponentActiveRow = yield* select(getOpponentActiveRow)
	if (!player || !activeRow || !activeRow.hermit) return
	if (!opponentActiveRow || !opponentActiveRow.hermit) return

	const attackData: AttackActionData = {
		type: actionType,
		payload: {
			player: player.entity,
		},
	}
	yield put(attackData)
}

export default attackSaga
