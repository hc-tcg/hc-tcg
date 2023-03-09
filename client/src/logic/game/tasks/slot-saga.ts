import {select} from 'typed-redux-saga'
import {put, takeLeading, call, take} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {CardT} from 'common/types/game-state'
import CARDS from 'server/cards'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	getAvailableActions,
	getSelectedCard,
	getPickProcess,
	getPlayerState,
} from 'logic/game/game-selectors'
import {
	setSelectedCard,
	setOpenedModal,
	removeEffect,
} from 'logic/game/game-actions'
import {changeActiveHermit, playCard, slotPicked} from 'logic/game/game-actions'

type SlotPickedAction = ReturnType<typeof slotPicked>

function* pickWithSelectedSaga(
	action: SlotPickedAction,
	selectedCard: CardT
): SagaIterator {
	const {slotType} = action.payload
	const selectedCardInfo = CARDS[selectedCard.cardId]

	// Validations
	if (!selectedCardInfo) {
		console.log('Unknown card id: ', selectedCard)
		return
	}

	const suBucket =
		slotType === 'single_use' &&
		['water_bucket', 'milk_bucket'].includes(selectedCardInfo.id)
	if (selectedCardInfo.type !== slotType && !suBucket) {
		console.log(
			`Invalid slot. Trying to place card of type [${selectedCardInfo.type}] to a slot of type [${slotType}]`
		)
		return
	}

	yield put(playCard({...action.payload, card: selectedCard}))

	yield put(setSelectedCard(null))
}

function* pickWithoutSelectedSaga(action: SlotPickedAction): SagaIterator {
	if (action.payload.slotType !== 'hermit') return
	const {slotType, rowHermitCard, rowIndex} = action.payload
	const playerId = yield* select(getPlayerId)
	const playerState = yield* select(getPlayerState)
	const clickedOnHermit = slotType === 'hermit' && rowHermitCard
	if (!playerState || !clickedOnHermit) return
	if (playerId !== action.payload.playerId) return

	if (playerState.board.activeRow === rowIndex) {
		yield put(setOpenedModal('attack'))
	} else {
		yield put(setOpenedModal('change-hermit-modal', action.payload))
		const result = yield take('CONFIRM_HERMIT_CHANGE')
		if (result.payload) {
			yield put(changeActiveHermit(action.payload))
		}
	}
}

function* slotPickedSaga(action: SlotPickedAction): SagaIterator {
	const availableActions = yield* select(getAvailableActions)
	const selectedCard = yield* select(getSelectedCard)
	const pickProcess = yield* select(getPickProcess)
	if (availableActions.includes('WAIT_FOR_TURN')) return

	if (action.payload.slotType === 'single_use') {
		const playerState = yield* select(getPlayerState)
		if (
			playerState?.board.singleUseCard &&
			!playerState?.board.singleUseCardUsed
		) {
			yield put(removeEffect())
			return
		}
	}

	if (pickProcess) {
		return
	} else if (selectedCard) {
		yield call(pickWithSelectedSaga, action, selectedCard)
	} else {
		yield call(pickWithoutSelectedSaga, action)
	}
}

function* slotSaga(): SagaIterator {
	yield takeLeading('SLOT_PICKED', slotPickedSaga)
}

export default slotSaga
