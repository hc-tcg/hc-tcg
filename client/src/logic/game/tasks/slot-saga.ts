import {select} from 'typed-redux-saga'
import {put, takeLeading, call, take} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {CardT} from 'common/types/game-state'
import CARDS from 'common/cards'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	getAvailableActions,
	getSelectedCard,
	getPickProcess,
	getPlayerState,
} from 'logic/game/game-selectors'
import {setSelectedCard, setOpenedModal, removeEffect} from 'logic/game/game-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {changeActiveHermit, playCard, slotPicked} from 'logic/game/game-actions'

type SlotPickedAction = ReturnType<typeof slotPicked>

function* pickWithSelectedSaga(action: SlotPickedAction, selectedCard: CardT): SagaIterator {
	const selectedCardInfo = CARDS[selectedCard.cardId]

	// Validations
	if (!selectedCardInfo) {
		console.log('Unknown card id: ', selectedCard)
		return
	}

	const payload = {pickedSlot: action.payload, card: selectedCard}
	yield put(playCard(payload))
	yield put(setSelectedCard(null))
}

function* pickWithoutSelectedSaga(action: SlotPickedAction): SagaIterator {
	if (action.payload.slot.type !== 'hermit') return
	const {slot, row} = action.payload
	const playerId = yield* select(getPlayerId)
	const playerState = yield* select(getPlayerState)
	const rowHermitCard = row ? playerState?.board.rows[row?.index]?.hermitCard : null
	const settings = yield* select(getSettings)
	const clickedOnHermit = slot.type === 'hermit' && rowHermitCard
	if (!playerState || !clickedOnHermit) return
	if (playerId !== action.payload.playerId) return

	if (playerState.board.activeRow === row?.index) {
		yield put(setOpenedModal('attack'))
	} else {
		if (settings.confirmationDialogs !== 'off') {
			yield put(setOpenedModal('change-hermit-modal', action.payload))
			const result = yield take('CONFIRM_HERMIT_CHANGE')
			if (result.payload) {
				yield put(changeActiveHermit(action.payload))
			}
		} else {
			yield put(changeActiveHermit(action.payload))
		}
	}
}

function* slotPickedSaga(action: SlotPickedAction): SagaIterator {
	const availableActions = yield* select(getAvailableActions)
	const selectedCard = yield* select(getSelectedCard)
	const pickProcess = yield* select(getPickProcess)
	if (availableActions.includes('WAIT_FOR_TURN')) return

	if (action.payload.slot.type === 'single_use') {
		const playerState = yield* select(getPlayerState)
		if (playerState?.board.singleUseCard && !playerState?.board.singleUseCardUsed) {
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
