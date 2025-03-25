import {CARDS} from 'common/cards'
import FrozenEffect from 'common/status-effects/frozen'
import {LocalCardInstance} from 'common/types/server-requests'
import {slotToPlayCardAction} from 'common/types/turn-action-data'
import {
	getAvailableActions,
	getCurrentPickMessage,
	getGameState,
	getPlayerState,
	getSelectedCard,
} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {call, put, putResolve, take, takeLeading} from 'typed-redux-saga'
import {select} from 'typed-redux-saga'
import {localPutCardInSlot} from '../local-state'

function* pickForPickRequestSaga(
	action: LocalMessageTable[typeof localMessages.GAME_SLOT_PICKED],
) {
	const currentPickRequest = yield* select(getCurrentPickMessage)
	if (!currentPickRequest) return

	yield put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		action: {
			type: 'PICK_REQUEST',
			entity: action.slotInfo.slotEntity,
		},
	})
}

function* pickWithSelectedSaga(
	action: LocalMessageTable[typeof localMessages.GAME_SLOT_PICKED],
	selectedCard: LocalCardInstance,
): SagaIterator {
	const pickInfo = action.slotInfo

	yield* putResolve<LocalMessage>({
		type: localMessages.GAME_CARD_SELECTED_SET,
		card: null,
	})

	// If the hand is clicked don't send data
	if (pickInfo.slotType !== 'hand') {
		const actionType = slotToPlayCardAction[CARDS[selectedCard.id].category]
		if (!actionType) return

		yield* localPutCardInSlot(action, selectedCard)

		if (pickInfo.card === null) {
			yield* put<LocalMessage>({
				type: localMessages.GAME_TURN_ACTION,
				action: {
					type: actionType,
					slot: pickInfo.slotEntity,
					card: selectedCard,
				},
			})
		}

		yield* put<LocalMessage>({
			type: localMessages.GAME_CARD_SELECTED_SET,
			card: null,
		})
	}
}

function* pickWithoutSelectedSaga(
	action: LocalMessageTable[typeof localMessages.GAME_SLOT_PICKED],
): SagaIterator {
	const {slotType} = action.slotInfo

	if (slotType !== 'hermit') return

	const playerState = yield* select(getPlayerState)
	const settings = yield* select(getSettings)
	const localGameState = yield* select(getGameState)

	let hermitRow = playerState?.board.rows.find(
		(row) => row.hermit.slot == action.slotInfo.slotEntity,
	)
	if (!hermitRow) return

	if (playerState?.board.activeRow === hermitRow.entity) {
		yield* put<LocalMessage>({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id: 'attack',
		})
	} else if (
		!localGameState?.statusEffects.find(
			(effect) =>
				effect.target.type === 'card' &&
				effect.target.card === action.slotInfo.card?.entity &&
				effect.id === FrozenEffect.id,
		)
	) {
		if (settings.confirmationDialogsEnabled) {
			yield* put<LocalMessage>({
				type: localMessages.GAME_MODAL_OPENED_SET,
				id: 'change-hermit-modal',
				info: action.slotInfo,
			})
			const result = yield* take<
				LocalMessageTable[typeof localMessages.GAME_ACTIONS_HERMIT_CHANGE_CONFIRM]
			>(localMessages.GAME_ACTIONS_HERMIT_CHANGE_CONFIRM)

			if (!result.confirmed) return
		}

		yield* put<LocalMessage>({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'CHANGE_ACTIVE_HERMIT',
				entity: action.slotInfo.slotEntity,
			},
		})
	}
}

function* slotPickedSaga(
	action: LocalMessageTable[typeof localMessages.GAME_SLOT_PICKED],
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
			yield* put<LocalMessage>({
				type: localMessages.GAME_TURN_ACTION,
				action: {
					type: 'REMOVE_EFFECT',
				},
			})
			return
		}
	}

	if (availableActions.includes('PICK_REQUEST')) {
		// Run a seperate saga for the pick request
		yield* call(pickForPickRequestSaga, action)
		return
	}

	if (selectedCard) {
		yield* call(pickWithSelectedSaga, action, selectedCard)
	} else {
		yield* call(pickWithoutSelectedSaga, action)
	}
}

function* slotSaga(): SagaIterator {
	yield* takeLeading(localMessages.GAME_SLOT_PICKED, slotPickedSaga)
}

export default slotSaga
