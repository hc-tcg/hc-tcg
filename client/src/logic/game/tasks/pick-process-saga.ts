import {select} from 'typed-redux-saga'
import {put, call, take, race, cancelled} from 'redux-saga/effects'
import {SagaIterator, eventChannel} from 'redux-saga'
import {PickedCardT, PickRequirmentT, CardTypeT} from 'types/pick-process'
import {CardT, PlayerState} from 'types/game-state'
import CARDS from 'server/cards'
import {equalCard} from 'server/utils'

import {getPlayerId} from 'logic/session/session-selectors'
import {getPlayerStateById} from 'logic/game/game-selectors'
import {
	setPickProcess,
	updatePickProcess,
	setSelectedCard,
	slotPicked,
} from 'logic/game/game-actions'

type AnyPickActionT =
	| ReturnType<typeof setSelectedCard>
	| ReturnType<typeof slotPicked>

// TODO - special donitions (only afk hermit, only empty item slot)
export const REQS: Record<string, Array<PickRequirmentT>> = {
	instant_health: [{target: 'player', type: 'hermit', amount: 1}],
	instant_health_ii: [{target: 'player', type: 'hermit', amount: 1}],
	golden_apple: [{target: 'player', type: 'hermit', amount: 1}],
	milk_bucket: [{target: 'player', type: 'hermit', amount: 1}],
	water_bucket: [{target: 'player', type: 'hermit', amount: 1}],
	composter: [{target: 'hand', type: 'any', amount: 2}],
	lead: [
		{target: 'opponent', type: 'item', amount: 1, active: true},
		{target: 'opponent', type: 'item', amount: 1, empty: true, active: false},
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

const validRow = (
	req: PickRequirmentT,
	cardPlayerState: PlayerState | null,
	rowIndex: number | null
) => {
	if (typeof rowIndex !== 'number') return true
	if (!cardPlayerState) return false
	const row = cardPlayerState?.board.rows[rowIndex]
	return row && row.hermitCard
}

const validTarget = (
	req: PickRequirmentT,
	cardPlayerState: PlayerState | null,
	playerId: string
) => {
	if (!req.hasOwnProperty('target')) return true
	// hand (or possibly sue?)
	if (!cardPlayerState) return req.target === 'hand'

	// board
	if (req.target === 'player' && playerId !== cardPlayerState.id) return false
	if (req.target === 'opponent' && playerId === cardPlayerState.id) return false

	return true
}

const validActive = (
	req: PickRequirmentT,
	cardPlayerState: PlayerState | null,
	rowIndex: number | null
) => {
	if (!req.hasOwnProperty('active')) return true
	if (!cardPlayerState || rowIndex === null) return false

	const hasActiveHermit = cardPlayerState?.board.activeRow !== null
	const isActive =
		hasActiveHermit && rowIndex === cardPlayerState?.board.activeRow

	return req.active === isActive
}

const validType = (req: PickRequirmentT, slotType: CardTypeT) => {
	if (!req.hasOwnProperty('type')) return true
	return req.type === 'any' ? true : req.type === slotType
}

const validEmpty = (req: PickRequirmentT, card: CardT | null) => {
	if (!req.hasOwnProperty('empty')) return !!card
	return req.empty === !card
}

const isDuplicate = (
	pickedCards: Array<PickedCardT>,
	pickedCard?: PickedCardT
) => {
	if (!pickedCard) return null
	console.log({pickedCards, pickedCard})
	return pickedCards.some((pCard) => equalCard(pCard.card, pickedCard.card))
}

function* pickSaga(req: PickRequirmentT, pickAction: AnyPickActionT) {
	const playerId = yield* select(getPlayerId)
	let pickedCard =
		pickAction.type === 'SET_SELECTED_CARD'
			? {slotType: 'hand', card: pickAction.payload, playerId}
			: pickAction.payload

	const cardPlayerId = pickedCard.playerId
	const rowIndex = 'rowIndex' in pickedCard ? pickedCard.rowIndex : null
	const cardPlayerState = yield* select(getPlayerStateById(cardPlayerId))
	const card = pickedCard.card
	const slotType = card ? CARDS[card.cardId].type : pickedCard.slotType

	if (!validRow(req, cardPlayerState, rowIndex))
		return console.log('Invalid row')
	if (!validTarget(req, cardPlayerState, playerId))
		return console.log('Invalid target')
	if (!validActive(req, cardPlayerState, rowIndex))
		return console.log('Invalid active')
	if (!validType(req, slotType)) return console.log('Invalid card type')
	if (!validEmpty(req, card)) return console.log('Invalid empty check')

	return pickedCard
}

export function* runPickProcessSaga(cardId: string): SagaIterator {
	try {
		const playerId = yield* select(getPlayerId)
		if (!cardId || !playerId) return

		const reqs = REQS[cardId]
		if (!reqs) return

		yield put(
			setPickProcess({
				id: cardId,
				requirments: reqs,
				pickedCards: [],
				currentReq: 0,
			})
		)

		const escapeChannel = eventChannel((emitter) => {
			const listener = (ev: KeyboardEvent) => {
				if (ev.key === 'Escape') emitter('Escape')
			}
			document.addEventListener('keydown', listener)
			return () => document.removeEventListener('keydown', listener)
		})

		const pickedCards: Array<PickedCardT> = []
		for (let reqIndex in reqs) {
			const req = reqs[reqIndex]
			const pickedReqCards = []
			while (pickedReqCards.length < req.amount) {
				const actionType =
					req.target === 'hand' ? 'SET_SELECTED_CARD' : 'SLOT_PICKED'

				console.log('waiting for card')
				const result = yield race({
					esc: take(escapeChannel),
					pickAction: take(actionType),
				})
				console.log('racing done')

				if (result.esc) {
					yield put(setPickProcess(null))
					return null
				}
				const {pickAction} = result
				const pickedCard = yield call(pickSaga, req, pickAction)
				if (isDuplicate(pickedReqCards, pickedCard)) continue
				if (!pickedCard) continue
				pickedReqCards.push(pickedCard)

				yield put(
					updatePickProcess(Number(reqIndex), [
						...pickedCards,
						...pickedReqCards,
					])
				)
			}
			pickedCards.push(...pickedReqCards)
		}
		yield put(setPickProcess(null))
		return pickedCards
	} finally {
		if (yield cancelled()) {
			yield put(setPickProcess(null))
		}
	}
}
