import {select} from 'typed-redux-saga'
import {put, takeLeading, call, take, putResolve} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {CardT} from 'common/types/game-state'
import {
	PickCardActionData,
	PlayCardActionData,
	slotToPlayCardAction,
} from 'common/types/action-data'
import {CARDS} from 'common/cards'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	getAvailableActions,
	getSelectedCard,
	getPlayerState,
	getPickProcess,
	getCurrentPickMessage,
} from 'logic/game/game-selectors'
import {setSelectedCard, setOpenedModal, removeEffect} from 'logic/game/game-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {changeActiveHermit, slotPicked} from 'logic/game/game-actions'

type SlotPickedAction = ReturnType<typeof slotPicked>

function* pickForPickRequestSaga(action: SlotPickedAction): SagaIterator {
	const currentPickRequest = yield* select(getCurrentPickMessage)
	if (!currentPickRequest) return

	// If it's the single use or health slot do nothing, you can't request those slots
	if (action.payload.slot.type !== 'single_use' && action.payload.slot.type !== 'health') {
		const actionData: PickCardActionData = {
			type: 'PICK_REQUEST',
			payload: {
				pickResult: {
					playerId: action.payload.playerId,
					rowIndex: action.payload.row?.index,
					card: action.payload.slot.card,
					slot: {
						type: action.payload.slot.type,
						index: action.payload.slot.index,
					},
				},
			},
		}

		yield put(actionData)
	}
}

function* pickWithSelectedSaga(action: SlotPickedAction, selectedCard: CardT): SagaIterator {
	const selectedCardInfo = CARDS[selectedCard.cardId]

	yield putResolve(setSelectedCard(null))

	// If it's the hand or health slot don't even bother sending
	if (action.payload.slot.type !== 'hand' && action.payload.slot.type !== 'health') {
		if (!selectedCardInfo) {
			// Validations
			console.log('Unknown card id: ', selectedCard)
			return
		}

		const actionData: PlayCardActionData = {
			type: slotToPlayCardAction[action.payload.slot.type],
			payload: {pickedSlot: action.payload, card: selectedCard, playerId: action.payload.playerId},
		}

		yield put(actionData)
	}
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

	if (availableActions.includes('PICK_REQUEST')) {
		// Run a seperate saga for the pick request
		yield call(pickForPickRequestSaga, action)
		return
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
