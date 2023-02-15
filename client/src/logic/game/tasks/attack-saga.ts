import {select} from 'typed-redux-saga'
import {call, put} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {CardT} from 'types/game-state'
import {HermitCardT} from 'types/cards'
import {CardInfoT, EffectCardT} from 'types/cards'
import CARDS from 'server/cards'
import {runPickProcessSaga} from './pick-process-saga'
import {getPlayerState} from 'logic/game/game-selectors'
// TODO - get rid of app game-selectors
import {getPlayerActiveRow} from '../../../app/game/game-selectors'
import {attack} from '../game-actions'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

type AttackAction = {
	type: 'ATTACK'
	payload: {
		type: 'zero' | 'primary' | 'secondary'
	}
}

export function* attackSaga(action: AttackAction): SagaIterator {
	const {type} = action.payload
	const playerState = yield* select(getPlayerState)
	const activeRow = yield* select(getPlayerActiveRow)
	if (!playerState || !activeRow || !activeRow.hermitCard) return

	const singleUseCard = playerState.board.singleUseCard
	const hermitCard = activeRow.hermitCard
	const singleUseInfo = singleUseCard
		? (TYPED_CARDS[singleUseCard.cardId] as EffectCardT)
		: null

	const result = {} as Record<string, Array<CardT>>
	if (singleUseInfo?.pickOn === 'attack') {
		result[singleUseInfo.id] = yield call(
			runPickProcessSaga,
			singleUseInfo.name,
			singleUseInfo.pickReqs
		)
		if (!result[singleUseInfo.id]) return
	}

	const cardId = hermitCard.cardId
	const cardInfo = CARDS[hermitCard.cardId]
	const hermitAttack = cardInfo?.[type] || null
	if (cardInfo?.pickOn === 'attack' && hermitAttack?.power) {
		result[cardId] = yield call(
			runPickProcessSaga,
			hermitAttack?.name || cardInfo.name,
			cardInfo.pickReqs
		)
		if (!result[cardId]) return
	}

	yield put(attack(type, result))
}

export default attackSaga
