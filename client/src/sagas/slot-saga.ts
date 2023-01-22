import {select, take} from 'typed-redux-saga'
import {put, takeLeading, takeLatest, call, cancel} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {RootState as RS} from 'store'
import {CardT, PlayerState} from 'types/game-state'
import {CardInfoT} from 'types/cards'
import CARDS from 'server/cards'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>
type SlotPickedAction = {type: 'SLOT_PICKED'; payload: any}
type PickProcessAction = {
	type: 'SET_PICK_PROCESS'
	payload: string | null
	callback?: (result: any) => void
}

/*
1. attack with a crossbow
2. activate picker
3. send attack msg with pick info
*/

function* pickWithSelectedSaga(
	action: SlotPickedAction,
	selectedCard: CardT
): SagaIterator {
	const {slotType} = action.payload
	const selectedCardInfo = TYPED_CARDS[selectedCard.cardId]

	// Validations
	if (!selectedCardInfo) {
		console.log('Unknown card id: ', selectedCard)
		return
	}
	if (selectedCardInfo.type !== slotType) {
		console.log(
			`Invalid slot. Trying to place card of type [${selectedCardInfo.type}] to a slot of type [${slotType}]`
		)
		return
	}

	if (slotType === 'single_use') {
		yield put({type: 'PLAY_CARD', payload: {card: selectedCard}})
		if (
			['instant_health', 'instant_health_ii', 'golden_apple'].includes(
				selectedCard.cardId
			)
		) {
			yield put({type: 'SET_PICK_PROCESS', payload: 'any_player_hermit'})
			const result = yield call(pickProcessSaga, {
				type: 'SET_PICK_PROCESS',
				payload: 'any_player_hermit',
			})
			if (!result) return
			yield put({type: 'APPLY_EFFECT', payload: {singleUsePick: result}})
		} else if (['splash_potion_of_healing'].includes(selectedCard.cardId)) {
			yield put({type: 'SET_OPENED_MODAL_ID', payload: 'confirm'})
		}
	} else {
		yield put({
			type: 'PLAY_CARD',
			payload: {card: selectedCard, ...action.payload},
		})
	}

	yield put({type: 'SET_SELECTED_CARD', payload: null})
}

function* pickWithoutSelectedSaga(action: SlotPickedAction): SagaIterator {
	const {slotType, rowHermitCard, rowIndex} = action.payload
	const playerId = yield* select((state: RS) => state.playerId)
	const playerState = yield* select(
		(state: RS) => state.gameState?.players[playerId]
	)
	const clickedOnHermit = slotType === 'hermit' && rowHermitCard
	if (!playerState || !clickedOnHermit) return

	if (playerState.board.activeRow === rowIndex) {
		yield put({type: 'SET_OPENED_MODAL_ID', payload: 'attack'})
	} else {
		yield put({type: 'CHANGE_ACTIVE_HERMIT', payload: action.payload})
	}
}

function* slotPickedSaga(action: SlotPickedAction): SagaIterator {
	const availableActions = yield* select((state: RS) => state.availableActions)
	const selectedCard = yield* select((state: RS) => state.selectedCard)
	const pickProcess = yield* select((state: RS) => state.pickProcess)
	if (availableActions.includes('WAIT_FOR_TURN')) return

	if (pickProcess) {
		return
	} else if (selectedCard) {
		yield call(pickWithSelectedSaga, action, selectedCard)
	} else {
		yield call(pickWithoutSelectedSaga, action)
	}
}

function* pickProcessSaga(action: PickProcessAction): SagaIterator {
	const pickProcess = action.payload
	if (!pickProcess) return
	// TODO - Proper validations for individual pick processes
	// if (pickProcess !== 'afk_opponent_hermit') return
	// TODO - Stop waiting on new turn
	const result = yield* take('SLOT_PICKED')
	const statePickProcess = yield* select((state: RS) => state.pickProcess)
	// failsafe, e.g. if someone ends turn while picking
	if (pickProcess !== statePickProcess) return
	yield put({type: 'SET_PICK_PROCESS', payload: null})
	action.callback?.(result.payload)
	return result.payload
}

function* slotSaga(): SagaIterator {
	yield takeLeading('SLOT_PICKED', slotPickedSaga)
	yield takeLatest(
		(action: any) => action.type === 'SET_PICK_PROCESS' && action.callback,
		pickProcessSaga
	)
}

export default slotSaga
