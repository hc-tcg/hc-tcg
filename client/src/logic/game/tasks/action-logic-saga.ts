import {CARDS} from 'common/cards'
import {isSingleUse} from 'common/cards/types'
import {LocalGameState} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import {LocalMessage, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {call, put} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
import {getPlayerEntity} from '../game-selectors'

function* singleUseSaga(card: LocalCardInstance): SagaIterator {
	let cardProps = CARDS[card.id]
	if (isSingleUse(cardProps) && cardProps.showConfirmationModal) {
		yield put<LocalMessage>({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id: 'confirm',
		})
	}
}

function* actionLogicSaga(gameState: LocalGameState): SagaIterator {
	const player = yield* select(getPlayerEntity)
	const pState = gameState.players[player]

	if (gameState.currentModalData && gameState.currentModalData.type) {
		const id = gameState.currentModalData?.type
		yield put<LocalMessage>({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id,
		})
	} else if (
		!pState.board.singleUseCardUsed &&
		pState.board.singleUse.card &&
		gameState.turn.currentPlayerEntity === player
	) {
		yield call(singleUseSaga, pState.board.singleUse.card)
	}
}

export default actionLogicSaga
