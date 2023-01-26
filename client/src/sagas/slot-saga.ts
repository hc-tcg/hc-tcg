import {select} from 'typed-redux-saga'
import {put, takeLeading, call} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {RootState as RS} from 'store'
import {CardT} from 'types/game-state'
import {CardInfoT} from 'types/cards'
import CARDS from 'server/cards'
import DAMAGE from 'server/const/damage'
import {runPickProcessSaga, REQS} from './pick-process-saga'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>
type SlotPickedAction = {type: 'SLOT_PICKED'; payload: any}

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

	const suBucket =
		slotType == 'single_use' &&
		['water_bucket', 'milk_bucket'].includes(selectedCardInfo.id)
	if (selectedCardInfo.type !== slotType && !suBucket) {
		console.log(
			`Invalid slot. Trying to place card of type [${selectedCardInfo.type}] to a slot of type [${slotType}]`
		)
		return
	}

	yield put({
		type: 'PLAY_CARD',
		payload: {...action.payload, card: selectedCard},
	})

	if (slotType === 'single_use') {
		// TODO - hacky check for now to avoid instant selection for attack effects
		const damageInfo = DAMAGE[selectedCardInfo.id]
		if (REQS[selectedCard.cardId] && !damageInfo) {
			const result = yield call(runPickProcessSaga, selectedCard.cardId)
			if (!result || !result.length) return
			// problem je ze v REQS je i bow/crossbow takze se zavola apply effect
			yield put({type: 'APPLY_EFFECT', payload: {pickedCards: result}})
		} else if (
			[
				'splash_potion_of_healing',
				'lava_bucket',
				'splash_potion_of_poison',
				'clock',
				'invisibility_potion',
				'fishing_rod',
				'emerald',
				'flint_&_steel',
			].includes(selectedCard.cardId)
		) {
			yield put({type: 'SET_OPENED_MODAL_ID', payload: 'confirm'})
		}
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

function* slotSaga(): SagaIterator {
	yield takeLeading('SLOT_PICKED', slotPickedSaga)
}

export default slotSaga
