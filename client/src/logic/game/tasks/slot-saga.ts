import {
	ChangeActiveHermitActionData,
	PickSlotActionData,
	PlayCardActionData,
	slotToPlayCardAction,
} from 'common/types/action-data'
import {LocalCardInstance} from 'common/types/server-requests'
import {LocalMessage, LocalMessageTable, actions} from 'logic/actions'
import {
	getAvailableActions,
	getCurrentPickMessage,
	getPlayerState,
	getSelectedCard,
} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {SagaIterator} from 'redux-saga'
import {call, put, putResolve, take, takeLeading} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
import {localPutCardInSlot, localRemoveCardFromHand} from '../local-state'

function* pickForPickRequestSaga(
	action: LocalMessageTable[typeof actions.GAME_SLOT_PICKED],
): SagaIterator {
	const currentPickRequest = yield* select(getCurrentPickMessage)
	if (!currentPickRequest) return

	const actionData: PickSlotActionData = {
		type: 'PICK_REQUEST',
		payload: {
			entity: action.slotInfo.slotEntity,
		},
	}

	yield put(actionData)
}

function* pickWithSelectedSaga(
	action: LocalMessageTable[typeof actions.GAME_SLOT_PICKED],
	selectedCard: LocalCardInstance,
): SagaIterator {
	const pickInfo = action.slotInfo

	yield putResolve<LocalMessage>({
		type: actions.GAME_CARD_SELECTED_SET,
		card: null,
	})

	// If the hand is clicked don't send data
	if (pickInfo.slotType !== 'hand') {
		const actionType = slotToPlayCardAction[selectedCard.props.category]
		if (!actionType) return

		yield* localPutCardInSlot(action, selectedCard)
		yield* localRemoveCardFromHand(selectedCard)

		const actionData: PlayCardActionData = {
			type: actionType,
			payload: {slot: pickInfo.slotEntity, card: selectedCard},
		}

		yield put(actionData)
	}
}

function* pickWithoutSelectedSaga(
	action: LocalMessageTable[typeof actions.GAME_SLOT_PICKED],
): SagaIterator {
	const {slotType} = action.slotInfo

	if (slotType !== 'hermit') return

	const playerState = yield* select(getPlayerState)
	const settings = yield* select(getSettings)

	let hermitRow = playerState?.board.rows.find(
		(row) => row.hermit.slot == action.slotInfo.slotEntity,
	)
	if (!hermitRow) return

	if (playerState?.board.activeRow === hermitRow.entity) {
		yield put<LocalMessage>({type: actions.GAME_MODAL_OPENED_SET, id: 'attack'})
	} else {
		if (settings.confirmationDialogs !== 'off') {
			yield put({
				type: actions.GAME_MODAL_OPENED_SET,
				id: 'change-hermit-modal',
				payload: action.slotInfo,
			})
			const result = yield take('CONFIRM_HERMIT_CHANGE')
			if (!result.payload) return
		}

		const data: ChangeActiveHermitActionData = {
			type: 'CHANGE_ACTIVE_HERMIT',
			payload: {
				entity: action.slotInfo.slotEntity,
			},
		}
		yield put(data)
	}
}

function* slotPickedSaga(
	action: LocalMessageTable[typeof actions.GAME_SLOT_PICKED],
): SagaIterator {
	const availableActions = yield* select(getAvailableActions)
	const selectedCard = yield* select(getSelectedCard)
	if (availableActions.includes('WAIT_FOR_TURN')) return

	if (action.slotInfo.slotType === 'single_use') {
		const playerState = yield* select(getPlayerState)
		if (
			playerState?.board.singleUse.card &&
			!playerState?.board.singleUseCardUsed
		) {
			yield put<LocalMessage>({type: actions.GAME_EFFECT_REMOVE})
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
