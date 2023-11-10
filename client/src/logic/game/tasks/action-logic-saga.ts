import {select, take} from 'typed-redux-saga'
import {call, put, fork} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {LocalGameState} from 'common/types/game-state'
import {runPickProcessSaga} from './pick-process-saga'
import {CardT} from 'common/types/game-state'
import {CARDS} from 'common/cards'
import {getPlayerId} from 'logic/session/session-selectors'
import {setOpenedModal, applyEffect, customModal} from 'logic/game/game-actions'
import SingleUseCard from 'common/cards/base/single-use-card'

function* borrowSaga(): SagaIterator {
	yield put(setOpenedModal('borrow'))
	const result = yield* take(['BORROW_ATTACH', 'BORROW_DISCARD'])
	if (result.type === 'BORROW_DISCARD') {
		yield put(customModal({modalResult: {attach: false}}))
		return
	}

	yield put(customModal({modalResult: {attach: true}}))
}

function* singleUseSaga(card: CardT): SagaIterator {
	// We use CARDS instead of SINGLE_USE_CARDS because of Water and Milk Buckets
	const cardInfo = CARDS[card.cardId]
	if (!cardInfo) return

	if (cardInfo instanceof SingleUseCard && cardInfo.canApply()) {
		yield put(setOpenedModal('confirm'))
	} else if (cardInfo.pickOn === 'apply') {
		const result = yield call(runPickProcessSaga, cardInfo.name, cardInfo.pickReqs)
		if (result && result.length && result[0].pickedSlots?.length) {
			yield put(applyEffect({pickResults: {[card.cardId]: result}}))
		} else {
			yield put(setOpenedModal('unmet-condition', {removeSuAfter: true}))
		}
	}
}

function* actionLogicSaga(gameState: LocalGameState): SagaIterator {
	const playerId = yield* select(getPlayerId)
	const pState = gameState.players[playerId]
	const lastActionResult = gameState.lastActionResult

	if (gameState.currentCustomModal !== null) {
		const id = gameState.currentCustomModal
		if (id === 'grian_rare') {
			yield fork(borrowSaga)
		} else if (id === 'evilxisuma_rare') {
			yield put(setOpenedModal('evilX'))
		} else if (id === 'shubbleyt_rare') {
			yield put(setOpenedModal('shubble'))
		} else if (id === 'spyglass') {
			yield put(setOpenedModal('spyglass'))
		} else if (id === 'looting') {
			yield put(setOpenedModal('looting'))
		} else if (id === 'chest') {
			yield put(setOpenedModal('chest'))
		}
	} else if (
		lastActionResult?.action === 'PLAY_SINGLE_USE_CARD' &&
		lastActionResult?.result === 'SUCCESS' &&
		!pState.board.singleUseCardUsed &&
		pState.board.singleUseCard
	) {
		yield call(singleUseSaga, pState.board.singleUseCard)
	} else if (lastActionResult?.result === 'FAILURE_CANNOT_ATTACH') {
		yield put(setOpenedModal('unmet-condition'))
	}
}

export default actionLogicSaga
