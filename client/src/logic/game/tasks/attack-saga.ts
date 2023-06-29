import {select} from 'typed-redux-saga'
import {call, put} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {PickResultT} from 'common/types/pick-process'
import {HERMIT_CARDS, SINGLE_USE_CARDS} from 'common/cards'
import {runPickProcessSaga} from './pick-process-saga'
import {getPlayerState, getOpponentState} from 'logic/game/game-selectors'
// TODO - get rid of app game-selectors
import {getPlayerActiveRow, getOpponentActiveRow} from '../../../app/game/game-selectors'
import {attack, startAttack} from '../game-actions'

type AttackAction = ReturnType<typeof startAttack>

export function* attackSaga(action: AttackAction): SagaIterator {
	const {type, extra} = action.payload
	const playerState = yield* select(getPlayerState)
	const opponentState = yield* select(getOpponentState)
	const activeRow = yield* select(getPlayerActiveRow)
	const opponentActiveRow = yield* select(getOpponentActiveRow)
	if (!playerState || !activeRow || !activeRow.hermitCard) return
	if (!opponentActiveRow || !opponentActiveRow.hermitCard) return

	const singleUseCard = playerState.board.singleUseCard
	const hermitCard = activeRow.hermitCard
	const singleUseInfo = singleUseCard ? SINGLE_USE_CARDS[singleUseCard.cardId] : null

	const result = {} as Record<string, Array<PickResultT>>
	if (singleUseInfo?.pickOn === 'attack') {
		result[singleUseInfo.id] = yield call(
			runPickProcessSaga,
			singleUseInfo.name,
			singleUseInfo.pickReqs
		)
		if (!result[singleUseInfo.id]) return
	}

	if (type === 'zero') {
		yield put(attack(type, result))
		return
	}

	const cardId = hermitCard.cardId
	const cardInfo = HERMIT_CARDS[cardId]
	const hermitAttack = cardInfo?.[type] || null

	if (cardInfo?.pickOn === 'attack' && hermitAttack?.power) {
		result[cardId] = yield call(
			runPickProcessSaga,
			hermitAttack?.name || cardInfo.name,
			cardInfo.pickReqs
		)
		if (!result[cardId]) return
	}

	const opponentHermit = opponentActiveRow.hermitCard
	const opponentCardInfo = opponentHermit ? HERMIT_CARDS[opponentHermit.cardId] : null
	if (
		opponentCardInfo?.pickOn === 'opponent-attack' &&
		opponentState?.custom[opponentCardInfo.id]
	) {
		result[opponentHermit.cardId] = yield call(
			runPickProcessSaga,
			opponentCardInfo?.[type]?.name || opponentCardInfo.name,
			opponentCardInfo.pickReqs
		)
		if (!result[opponentHermit.cardId]) return
	}

	yield put(attack(type, result, extra))
}

export default attackSaga
