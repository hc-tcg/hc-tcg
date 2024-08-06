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
import {actions, LocalMessageTable} from 'logic/actions'

export function* attackSaga(
	action: LocalMessageTable[typeof actions.GAME_ATTACK_START],
): SagaIterator {
	const {attackType} = action
	const actionType = attackToAttackAction[attackType]

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
