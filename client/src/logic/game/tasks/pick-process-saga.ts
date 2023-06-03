import {select} from 'typed-redux-saga'
import {put, call, take, race, cancelled} from 'redux-saga/effects'
import {SagaIterator, eventChannel} from 'redux-saga'
import {PickedSlotT, PickRequirmentT, PickResultT} from 'common/types/pick-process'
import {equalCard} from 'server/utils'
import {validPick, validPicks} from 'server/utils/reqs'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	getGameState,
	getCurrentPlayerState,
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
	pickedSlots: Array<PickedSlotT>,
	pickedSlot?: PickedSlotT
) => {
	if (!pickedSlot) return null
	return pickedSlots.some((pSlot) => equalCard(pSlot.card, pickedSlot.card))
}

function* validatePickSaga(
	req: PickRequirmentT,
	pickAction: AnyPickActionT
): SagaIterator<PickedSlotT | void> {
	const playerId = yield* select(getPlayerId)
	const pickedSlot: PickedSlotT =
		pickAction.type === 'SET_SELECTED_CARD'
			? {slotType: 'hand', card: pickAction.payload, playerId}
			: pickAction.payload

	const gameState = yield* select(getGameState)
	if (!gameState) return
	if (!validPick(gameState, req, pickedSlot)) return
	return pickedSlot
}

function* breakIfSaga(
	breakIf: PickRequirmentT['breakIf'],
	pickedCard: PickedSlotT
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
): SagaIterator<Array<PickResultT> | null> {
	try {
		const gameState = yield* select(getGameState)
		const playerId = yield* select(getPlayerId)
		if (!name || !reqs || !playerId || !gameState) return null
		
		// Listen for Escape to cancel
		const escapeChannel = eventChannel((emitter) => {
			const listener = (ev: KeyboardEvent) => {
				if (ev.key === 'Escape') emitter('Escape')
			}
			document.addEventListener('keydown', listener)
			return () => document.removeEventListener('keydown', listener)
		})

		while (true) {
			// Start Pick Process
			yield put(
				setPickProcess({
					name,
					requirments: reqs,
					pickedSlots: [],
					currentReq: 0,
				})
			)

			const pickResult: Array<PickResultT> = []
			const allPickedSlots: Array<PickedSlotT> = []
			req_cycle:for (const reqIndex in reqs) {
				const req = reqs[reqIndex]
				const pickedReqSlots: Array<PickedSlotT> = []
				const actionType = req.target === 'hand' ? 'SET_SELECTED_CARD' : 'SLOT_PICKED'

				while (pickedReqSlots.length < req.amount) {

					// Update currentReq, used to display the correct message
					yield put(updatePickProcess({currentReq: Number(reqIndex)}))

					// Wait for the user to pick a slot
					const result = yield race({
						esc: take(escapeChannel),
						pickAction: take(actionType),
					})

					// If Escape was pressed, cancel pick process
					if (result.esc) {
						yield put(setPickProcess(null))
						return null
					}

					// Validate the picked slot
					const pickedSlot = yield call(validatePickSaga, req, result.pickAction)
					if (isDuplicate(pickedReqSlots, pickedSlot) || !pickedSlot) continue
					if (!pickedSlot) continue
					pickedReqSlots.push(pickedSlot)

					// Update the picked slots so far, used for outline of hand slots
					yield put(
						updatePickProcess({pickedSlots: [...allPickedSlots, ...pickedReqSlots]})
					)

					const matches = yield call(breakIfSaga, req.breakIf, pickedSlot)
					if (matches) {
						pickResult.push({req, pickedSlots: pickedReqSlots})
						break req_cycle
					}
				}
				
				pickResult.push({req, pickedSlots: pickedReqSlots})
				allPickedSlots.push(...pickedReqSlots)
			}

			// Validate all the picked slots before returning otherwise restart the pick process
			// We have to validate all the picks at once because of the adjacency requirement
			if (validPicks(gameState, pickResult)) {
				yield put(setPickProcess(null))
				return pickResult
			}
		}
	} finally {
		if (yield cancelled()) {
			yield put(setPickProcess(null))
		}
	}
}
