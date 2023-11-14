import {select} from 'typed-redux-saga'
import {put} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {getPlayerState} from 'logic/game/game-selectors'
// TODO - get rid of app game-selectors
import {getPlayerActiveRow, getOpponentActiveRow} from '../../../app/game/game-selectors'
import {startAttack} from '../game-actions'
import {AttackActionData, attackToAttackAction} from 'common/types/action-data'

type AttackAction = ReturnType<typeof startAttack>

export function* attackSaga(action: AttackAction): SagaIterator {
	const {type} = action.payload
	const actionType = attackToAttackAction[type]

	const player = yield* select(getPlayerState)
	const activeRow = yield* select(getPlayerActiveRow)
	const opponentActiveRow = yield* select(getOpponentActiveRow)
	if (!player || !activeRow || !activeRow.hermitCard) return
	if (!opponentActiveRow || !opponentActiveRow.hermitCard) return

	const attackData: AttackActionData = {
		type: actionType,
		payload: {
			playerId: player.id,
		},
	}
	yield put(attackData)
}

export default attackSaga
