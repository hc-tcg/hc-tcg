import {isSingleUse} from 'common/cards/base/types'
import {LocalGameState} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import {LocalMessage, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {call, put} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
import {getPlayerEntity} from '../game-selectors'

function* singleUseSaga(card: LocalCardInstance): SagaIterator {
	if (isSingleUse(card.props) && card.props.showConfirmationModal) {
		yield put<LocalMessage>({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id: 'confirm',
		})
	}
}

function* actionLogicSaga(gameState: LocalGameState): SagaIterator {
	const player = yield* select(getPlayerEntity)
	const pState = gameState.players[player]
	const lastActionResult = gameState.lastActionResult

	if (gameState.currentModalData && gameState.currentModalData.modalId) {
		const id = gameState.currentModalData?.modalId
		yield put<LocalMessage>({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id,
		})
	} else if (
		lastActionResult?.action === 'PLAY_SINGLE_USE_CARD' &&
		lastActionResult?.result === 'SUCCESS' &&
		!pState.board.singleUseCardUsed &&
		pState.board.singleUse.card
	) {
		yield call(singleUseSaga, pState.board.singleUse.card)
	} else if (lastActionResult?.result === 'FAILURE_UNMET_CONDITION') {
		yield put<LocalMessage>({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id: 'unmet-condition',
		})
	}
}

export default actionLogicSaga
