import {select} from 'typed-redux-saga'
import {put, call, take, race, cancelled} from 'redux-saga/effects'
import {SagaIterator, eventChannel} from 'redux-saga'
import {PickedCardT, PickRequirmentT} from 'common/types/pick-process'
import {equalCard} from 'server/utils'
import {anyAvailableReqOptions, validPick} from 'server/utils/reqs'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	getGameState,
	getCurrentPlayerState,
	getInactivePlayerState,
	getPlayerStateById,
} from 'logic/game/game-selectors'
import {
	setPickProcess,
	updatePickProcess,
	setSelectedCard,
	slotPicked,
} from 'logic/game/game-actions'

type AnyPickActionT =
	| ReturnType<typeof setSelectedCard>
	| ReturnType<typeof slotPicked>

const isDuplicate = (
	pickedCards: Array<PickedCardT>,
	pickedCard?: PickedCardT
) => {
	if (!pickedCard) return null
	console.log({pickedCards, pickedCard})
	return pickedCards.some((pCard) => equalCard(pCard.card, pickedCard.card))
}

function* validatePickSaga(
	req: PickRequirmentT,
	pickAction: AnyPickActionT
): SagaIterator<PickedCardT | void> {
	const playerId = yield* select(getPlayerId)
	const pickedCard: PickedCardT =
		pickAction.type === 'SET_SELECTED_CARD'
			? {slotType: 'hand', card: pickAction.payload, playerId}
			: pickAction.payload

	const gameState = yield* select(getGameState)
	if (!gameState) return
	if (!validPick(gameState, req, pickedCard)) return
	return pickedCard
}

function* breakIfSaga(
	breakIf: PickRequirmentT['breakIf'],
	pickedCard: PickedCardT
): SagaIterator<boolean> {
	if (!breakIf) return false
	const cardPlayerState = yield* select(getPlayerStateById(pickedCard.playerId))
	const currentPlayerState = yield* select(getCurrentPlayerState)
	if (!cardPlayerState || !currentPlayerState) return false
	return breakIf.some((rule) => {
		if (rule === 'active' && 'rowIndex' in pickedCard) {
			return pickedCard.rowIndex === cardPlayerState.board.activeRow
		} else if (rule === 'efficiency') {
			return !!currentPlayerState.custom['efficiency']
		}
	})
}

export function* runPickProcessSaga(
	name: string,
	reqs?: Array<PickRequirmentT>
): SagaIterator<Array<PickedCardT> | null> {
	try {
		const playerId = yield* select(getPlayerId)
		if (!name || !reqs || !playerId) return null

		const gameState = yield* select(getGameState)
		const playerState = yield* select(getCurrentPlayerState)
		const opponentState = yield* select(getInactivePlayerState)

		const pickPossible = anyAvailableReqOptions(
			gameState,
			playerState,
			opponentState,
			reqs
		)
		if (!pickPossible) return []

		yield put(
			setPickProcess({
				name,
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
		req_cycle: for (const reqIndex in reqs) {
			const req = reqs[reqIndex]
			const pickedReqCards = []

			while (pickedReqCards.length < req.amount) {
				const actionType =
					req.target === 'hand' ? 'SET_SELECTED_CARD' : 'SLOT_PICKED'

				yield put(updatePickProcess({currentReq: Number(reqIndex)}))
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
				const pickedCard = yield call(validatePickSaga, req, pickAction)
				if (isDuplicate(pickedReqCards, pickedCard)) continue
				if (!pickedCard) continue
				pickedReqCards.push(pickedCard)

				yield put(
					updatePickProcess({pickedCards: [...pickedCards, ...pickedReqCards]})
				)

				const matches = yield call(breakIfSaga, req.breakIf, pickedCard)
				if (matches) {
					pickedCards.push(...pickedReqCards)
					break req_cycle
				}
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
