import {select, take} from 'typed-redux-saga'
import {put, call, takeLatest} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {RootState as RS} from 'store'
import {PickProcessT, PickRequirmentT} from 'types/pick-process'
import {CardT} from 'types/game-state'
import CARDS from 'server/cards'

import {getPlayerId} from 'logic/session/session-selectors'
import {getPlayerStateById} from 'logic/game/game-selectors'
import {setPickProcess, updatePickProcess} from 'logic/game/game-actions'

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
	bow: [{target: 'opponent', type: 'hermit', amount: 1, active: false}],
	crossbow: [{target: 'opponent', type: 'hermit', amount: 1, active: false}],
	looting: [{target: 'opponent', type: 'item', amount: 1, active: true}],
	grian_rare: [{target: 'player', type: 'effect', amount: 1, empty: true}],
	hypnotizd_rare: [
		{target: 'opponent', type: 'hermit', amount: 1},
		{target: 'player', type: 'item', amount: 1, active: true},
	],
	keralis_rare: [{target: 'player', type: 'hermit', amount: 1, active: false}],
	tangotek_rare: [{target: 'player', type: 'hermit', amount: 1, active: false}],
}

// TODO - clicking on the single use card slot while picking should stop the picking process (as should pressing ESC)
// and it will remove the singel use effect card from the slot and return it to players hand
export function* runPickProcessSaga(cardId: string): SagaIterator {
	const playerId = yield* select(getPlayerId)
	if (!cardId || !playerId) return
	// TODO - Proper validations for individual pick processes
	// if (pickProcess !== 'afk_opponent_hermit') return
	// TODO - Stop waiting on new turn

	const reqs = REQS[cardId]
	if (!reqs) return

	yield put(
		setPickProcess({
			id: cardId,
			requirments: reqs,
			pickedCards: [],
		})
	)

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
				if (req.target === 'player' && playerId !== cardPlayerId) continue
				if (req.target === 'opponent' && playerId === cardPlayerId) continue

				const pState = yield* select(getPlayerStateById(cardPlayerId))

				const isActive =
					pState?.board.activeRow !== null &&
					pickAction.payload.rowIndex === pState?.board.activeRow
				if (req.hasOwnProperty('active') && req.active !== isActive) continue
			}

			// TODO - I don't think we are checking if the slot is really empty
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
			yield put(updatePickProcess([...pickedCards, ...pickedReqCards]))

			// failsafe, e.g. if someone ends turn while picking
			/* TODO
			const statePickProcess = yield* select((state: RS) => state.pickProcess)
			if (pickProcess !== statePickProcess) return
			*/
		}
		pickedCards.push(...pickedReqCards)
	}
	yield put(setPickProcess(null))
	return pickedCards
}
