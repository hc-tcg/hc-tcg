import {select} from 'typed-redux-saga'
import {put, takeLeading, call, take, putResolve} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {
	ChangeActiveHermitActionData,
	PickSlotActionData,
	PlayCardActionData,
	slotToPlayCardAction,
} from 'common/types/action-data'
import {
	getAvailableActions,
	getSelectedCard,
	getPlayerState,
	getCurrentPickMessage,
} from 'logic/game/game-selectors'
import {setSelectedCard, setOpenedModal, removeEffect, slotPicked} from 'logic/game/game-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {LocalCardInstance} from 'common/types/server-requests'

type SlotPickedAction = ReturnType<typeof slotPicked>

function* pickForPickRequestSaga(action: SlotPickedAction): SagaIterator {
	const currentPickRequest = yield* select(getCurrentPickMessage)
	if (!currentPickRequest) return

	const slot = action.payload.slot

	const actionData: PickSlotActionData = {
		type: 'PICK_REQUEST',
		payload: {
			entity: slot.slotEntity,
		},
	}

	yield put(actionData)
}

function* makeCardLookPlayedHack(action: SlotPickedAction, selectedCard: LocalCardInstance) {
	let playerState = yield* select(getPlayerState)
	let board = playerState?.board
	let slot = action.payload.slot
	if (!board) return

	let row = action.payload.row
	let index = action.payload.index

	if (slot.slotType === 'single_use') {
		board.singleUse = {slot: slot.slotEntity, card: selectedCard}
	}
	if (slot.slotType === 'hermit' && row !== undefined) {
		board.rows[row].hermit = {slot: slot.slotEntity, card: selectedCard as any}

		if (board.activeRow) {
			board.activeRow = board.rows[row].entity
		}
	}
	if (slot.slotType === 'attach' && row !== undefined) {
		board.rows[row].attach = {slot: slot.slotEntity, card: selectedCard as any}
	}
	if (slot.slotType === 'item' && row !== undefined && index !== undefined) {
		board.rows[row].items[index] = {slot: slot.slotEntity, card: selectedCard as any}
	}

	yield put({type: 'UPDATE_BOARD'})
}

function* pickWithSelectedSaga(
	action: SlotPickedAction,
	selectedCard: LocalCardInstance
): SagaIterator {
	const pickInfo = action.payload.slot

	yield putResolve(setSelectedCard(null))

	// If the hand is clicked don't send data
	if (pickInfo.slotType !== 'hand') {
		const actionType = slotToPlayCardAction[selectedCard.props.category]
		if (!actionType) return

		yield *makeCardLookPlayedHack(action, selectedCard)

		const actionData: PlayCardActionData = {
			type: actionType,
			payload: {slot: pickInfo.slotEntity, card: selectedCard},
		}

		yield put(actionData)
	}
}

function* pickWithoutSelectedSaga(action: SlotPickedAction): SagaIterator {
	const {slotType} = action.payload.slot

	if (slotType !== 'hermit') return

	const playerState = yield* select(getPlayerState)
	const settings = yield* select(getSettings)

	let hermitRow = playerState?.board.rows.find(
		(row) => row.hermit.slot == action.payload.slot.slotEntity
	)
	if (!hermitRow) return

	if (playerState?.board.activeRow === hermitRow.entity) {
		yield put(setOpenedModal('attack'))
	} else {
		if (settings.confirmationDialogs !== 'off') {
			yield put(setOpenedModal('change-hermit-modal', action.payload.slot))
			const result = yield take('CONFIRM_HERMIT_CHANGE')
			if (!result.payload) return
		}

		const data: ChangeActiveHermitActionData = {
			type: 'CHANGE_ACTIVE_HERMIT',
			payload: {
				entity: action.payload.slot.slotEntity,
			},
		}
		yield put(data)
	}
}

function* slotPickedSaga(action: SlotPickedAction): SagaIterator {
	const availableActions = yield* select(getAvailableActions)
	const selectedCard = yield* select(getSelectedCard)
	if (availableActions.includes('WAIT_FOR_TURN')) return

	if (action.payload.slot.slotType === 'single_use') {
		const playerState = yield* select(getPlayerState)
		if (playerState?.board.singleUse.card && !playerState?.board.singleUseCardUsed) {
			yield put(removeEffect())
			return
		}
	}

	if (availableActions.includes('PICK_REQUEST')) {
		// Run a seperate saga for the pick request
		yield call(pickForPickRequestSaga, action)
		return
	}

	if (selectedCard) {
		yield call(pickWithSelectedSaga, action, selectedCard)
	} else {
		yield call(pickWithoutSelectedSaga, action)
	}
}

function* slotSaga(): SagaIterator {
	yield takeLeading('SLOT_PICKED', slotPickedSaga)
}

export default slotSaga
