import {select, take} from 'typed-redux-saga'
import {call, put, fork} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {LocalGameState} from 'common/types/game-state'
import {CardT} from 'common/types/game-state'
import {CARDS} from 'common/cards'
import {getPlayerId} from 'logic/session/session-selectors'
import {setOpenedModal, applyEffect, modalRequest} from 'logic/game/game-actions'
import SingleUseCard from 'common/cards/base/single-use-card'

function* singleUseSaga(card: CardT): SagaIterator {
	// We use CARDS instead of SINGLE_USE_CARDS because of Water and Milk Buckets
	const cardInfo = CARDS[card.cardId]
	if (!cardInfo) return

	if (cardInfo instanceof SingleUseCard && cardInfo.canApply()) {
		yield put(setOpenedModal('confirm'))
	}
}

function* actionLogicSaga(gameState: LocalGameState): SagaIterator {
	const playerId = yield* select(getPlayerId)
	const pState = gameState.players[playerId]
	const lastActionResult = gameState.lastActionResult

	if (gameState.currentModalData && gameState.currentModalData.modalId) {
		const id = gameState.currentModalData?.modalId
		yield put(setOpenedModal(id))
	} else if (
		lastActionResult?.action === 'PLAY_SINGLE_USE_CARD' &&
		lastActionResult?.result === 'SUCCESS' &&
		!pState.board.singleUseCardUsed &&
		pState.board.singleUseCard
	) {
		yield call(singleUseSaga, pState.board.singleUseCard)
	} else if (lastActionResult?.result === 'FAILURE_UNMET_CONDITION') {
		yield put(setOpenedModal('unmet-condition'))
	}
}

export default actionLogicSaga
