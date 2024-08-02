import {isSingleUse} from 'common/cards/base/types'
import {LocalGameState} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import {setOpenedModal} from 'logic/game/game-actions'
import {getPlayerId} from 'logic/session/session-selectors'
import {SagaIterator} from 'redux-saga'
import {call, put} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'

function* singleUseSaga(card: LocalCardInstance): SagaIterator {
	if (isSingleUse(card.props) && card.props.showConfirmationModal) {
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
		pState.board.singleUse.card
	) {
		yield call(singleUseSaga, pState.board.singleUse.card)
	} else if (lastActionResult?.result === 'FAILURE_UNMET_CONDITION') {
		yield put(setOpenedModal('unmet-condition'))
	}
}

export default actionLogicSaga
