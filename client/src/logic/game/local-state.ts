import {LocalCardInstance} from 'common/types/server-requests'
import {slotPicked} from './game-actions'
import {put, select} from 'typed-redux-saga'
import {getGameState} from './game-selectors'
import {HasHealth} from 'common/cards/base/types'

// This file has routines to force the client to update before a message is recieved from the server.

type SlotPickedAction = ReturnType<typeof slotPicked>

/** Make the client look like a card has been placed in a slot */
export function* localPutCardInSlot(action: SlotPickedAction, selectedCard: LocalCardInstance) {
	let playerState = Object.values((yield* select(getGameState))?.players || {}).find(
		(player) => player.entity === action.payload.player
	)
	if (!playerState) throw new Error('Player state not found.')

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
		board.rows[row].health = (selectedCard as LocalCardInstance<HasHealth>).props.health

		if (!board.activeRow) {
			board.activeRow = board.rows[row].entity
		}
	}
	if (slot.slotType === 'attach' && row !== undefined) {
		board.rows[row].attach = {slot: slot.slotEntity, card: selectedCard as any}
	}
	if (slot.slotType === 'item' && row !== undefined && index !== undefined) {
		board.rows[row].items[index] = {slot: slot.slotEntity, card: selectedCard as any}
	}

	yield* put({type: 'UPDATE_GAME'})
}

/** Make the client look like a card has been removed from the hand. */
export function* localRemoveCardFromHand(selectedCard: LocalCardInstance) {
	let localPlayerState = yield* select(getGameState)

	if (!localPlayerState?.hand) return

	localPlayerState.hand = localPlayerState.hand.filter(
		(card) => card.entity !== selectedCard.entity
	)

	yield* put({type: 'UPDATE_GAME'})
}

/** Make the client look like the turn has ended */
export function* localEndTurn() {
	let localPlayerState = yield* select(getGameState)
	if (localPlayerState?.turn) {
		localPlayerState.turn.currentPlayerEntity = localPlayerState?.opponentPlayerEntity
		localPlayerState.turn.currentPlayerId = localPlayerState?.opponentPlayerId
		localPlayerState.turn.turnNumber++
	}

	yield* put({type: 'UPDATE_GAME'})
}
