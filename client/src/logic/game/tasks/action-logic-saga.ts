import {select, take} from 'typed-redux-saga'
import {call, put, fork} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {LocalGameState} from 'common/types/game-state'
import {runPickProcessSaga} from './pick-process-saga'
import {CardT} from 'common/types/game-state'
import {CARDS} from 'common/cards'
import {getPlayerId} from 'logic/session/session-selectors'
import {setOpenedModal, followUp, applyEffect, removeEffect} from 'logic/game/game-actions'
import HermitCard from 'common/cards/base/hermit-card'
import SingleUseCard from 'common/cards/base/single-use-card'
import Card from 'common/cards/base/card'
import {receiveMsg} from 'logic/socket/socket-saga'

function* borrowSaga(): SagaIterator {
	yield put(setOpenedModal('borrow'))
	const result = yield* take(['BORROW_ATTACH', 'BORROW_DISCARD'])
	if (result.type === 'BORROW_DISCARD') {
		yield put(followUp({modalResult: {attach: false}}))
		return
	}

	yield put(followUp({modalResult: {attach: true}}))
}

function* singleUseSaga(card: CardT): SagaIterator {
	// We use CARDS instead of SINGLE_USE_CARDS because of Water and Milk Buckets
	const cardInfo = CARDS[card.cardId]
	if (!cardInfo) return

	if (cardInfo instanceof SingleUseCard && cardInfo.canApply()) {
		yield put(setOpenedModal('confirm'))
	} else if (card.cardId === 'chest') {
		yield put(setOpenedModal('chest'))
	} else if (cardInfo.pickOn === 'apply') {
		const result = yield call(runPickProcessSaga, cardInfo.name, cardInfo.pickReqs)
		if (result && result.length && result[0].pickedSlots?.length) {
			yield put(applyEffect({pickResults: {[card.cardId]: result}}))
		} else {
			yield put(setOpenedModal('unmet-condition', {removeSuAfter: true}))
		}
	}
}

const getFollowUpName = (cardInfo: Card) => {
	if (cardInfo instanceof HermitCard) {
		if (cardInfo.primary.power) return cardInfo.primary.name
		if (cardInfo.secondary.power) return cardInfo.secondary.name
	}

	return cardInfo.name
}

function* actionLogicSaga(gameState: LocalGameState): SagaIterator {
	const playerId = yield* select(getPlayerId)
	const pState = gameState.players[playerId]
	const lastActionResult = gameState.lastActionResult

	if (Object.keys(pState.followUp).length > 0) {
		for (const cardId of Object.values(pState.followUp)) {
			const cardInfo = CARDS[cardId]
			if (cardInfo?.pickOn === 'followup') {
				let pickResults = null
				const name = getFollowUpName(cardInfo)
				while (!pickResults) pickResults = yield call(runPickProcessSaga, name, cardInfo.pickReqs)
				yield put(followUp({pickResults: {[cardId]: pickResults}}))
			} else if (cardId === 'grian_rare') {
				yield fork(borrowSaga)
			} else if (cardId === 'evilxisuma_rare') {
				yield put(setOpenedModal('evilX'))
			} else if (cardId === 'spyglass') {
				yield put(setOpenedModal('spyglass'))
			} else if (cardId === 'looting') {
				yield put(setOpenedModal('looting'))
			} else {
				// The server can set the next follow up
				yield put(followUp({}))
			}
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
