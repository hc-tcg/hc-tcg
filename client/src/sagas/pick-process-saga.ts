import {select, take} from 'typed-redux-saga'
import {put, call, takeLatest} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {RootState as RS} from 'store'
import {PickProcessT, PickRequirmentT} from 'types/pick-process'
import {CardT} from 'types/game-state'
import CARDS from 'server/cards'

type RunPickProcessAction = {
	type: 'SET_PICK_PROCESS'
	payload: string
	callback?: (result: any) => void
}

// TODO - special donitions (only afk hermit, only empty item slot)
export const REQS: Record<string, Array<PickRequirmentT>> = {
	instant_health: [{target: 'player', type: 'hermit', amount: 1}],
	instant_health_ii: [{target: 'player', type: 'hermit', amount: 1}],
	golden_apple: [{target: 'player', type: 'hermit', amount: 1}],
	milk_bucket: [{target: 'player', type: 'hermit', amount: 1}],
	water_bucket: [{target: 'player', type: 'hermit', amount: 1}],
	composter: [{target: 'hand', type: 'any', amount: 2}],
	lead: [
		{target: 'opponent', type: 'item', amount: 1},
		{target: 'opponent', type: 'item', amount: 1, empty: true},
	],
	bow: [{target: 'opponent', type: 'hermit', amount: 1}],
	crossbow: [{target: 'opponent', type: 'hermit', amount: 1}],
	looting: [{target: 'opponent', type: 'item', amount: 1}],
	grian_rare: [{target: 'player', type: 'effect', amount: 1, empty: true}],
}

// TODO - clicking on the single use card slot while picking should stop the picking process (as should pressing ESC)
// and it will remove the singel use effect card from the slot and return it to players hand
export function* runPickProcessSaga(singleUseCardId: string): SagaIterator {
	const turnPlayerId = yield* select(
		(state: RS) => state.gameState?.turnPlayerId
	)
	const playerId = yield* select((state: RS) => state.playerId)
	if (!singleUseCardId || !turnPlayerId || !playerId) return
	// TODO - Proper validations for individual pick processes
	// if (pickProcess !== 'afk_opponent_hermit') return
	// TODO - Stop waiting on new turn

	const reqs = REQS[singleUseCardId]
	if (!reqs) return

	yield put({
		type: 'SET_PICK_PROCESS',
		payload: {
			requirments: reqs,
			pickedCards: [],
		},
	})

	const pickedCards: Array<CardT> = []
	for (let req of reqs) {
		const pickedReqCards = []
		while (pickedReqCards.length < req.amount) {
			const pickAction = yield* take(
				req.target === 'hand' ? 'SET_SELECTED_CARD' : 'SLOT_PICKED'
			)

			// check ownership
			const cardPlayerId = pickAction.payload.playerId
			if (cardPlayerId) {
				if (req.target === 'player' && turnPlayerId !== cardPlayerId) continue
				if (req.target === 'opponent' && turnPlayerId === cardPlayerId) continue
			}

			if (req.empty) {
				// check card info
				const slotType = pickAction.payload.slotType
				const correctType = req.type === 'any' ? true : req.type === slotType
				if (!correctType) continue

				pickedReqCards.push(pickAction.payload)
			} else {
				// check card
				const card =
					pickAction.type === 'SET_SELECTED_CARD'
						? pickAction.payload
						: pickAction.payload.card
				if (!card) continue

				// check card info
				const cardInfo = CARDS[card.cardId]
				const correctType =
					req.type === 'any' ? true : req.type === cardInfo.type
				if (!correctType) continue

				pickedReqCards.push(
					req.target === 'hand'
						? {slotType: 'hand', card, playerId}
						: pickAction.payload
				)
			}
			yield put({
				type: 'UPDATE_PICK_PROCESS',
				payload: [...pickedCards, ...pickedReqCards],
			})

			// failsafe, e.g. if someone ends turn while picking
			/* TODO
			const statePickProcess = yield* select((state: RS) => state.pickProcess)
			if (pickProcess !== statePickProcess) return
			*/
		}
		pickedCards.push(...pickedReqCards)
	}
	yield put({type: 'SET_PICK_PROCESS', payload: null})
	return pickedCards
}

export function* runActionPickProcessSaga(
	action: RunPickProcessAction
): SagaIterator {
	console.log('>>>: ', 'RUN_PICK_PROCESS', action)
	const singleUseCardId = action.payload
	const result = yield call(runPickProcessSaga, singleUseCardId)
	action.callback?.(result)
}

function* pickProcessSaga(): SagaIterator {
	yield takeLatest('RUN_PICK_PROCESS', runActionPickProcessSaga)
}

export default pickProcessSaga
