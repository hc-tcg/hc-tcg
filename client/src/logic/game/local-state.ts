import {HasHealth, isHermit, isItem} from 'common/cards/base/types'
import {LocalCardInstance} from 'common/types/server-requests'
import {ChangeActiveHermitActionData} from 'common/types/turn-action-data'
import {hasEnoughEnergy} from 'common/utils/attacks'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {put, select} from 'typed-redux-saga'
import {getCopyOfGameState} from './game-selectors'

// This file has routines to force the client to update before a message is recieved from the server.

/** Make the client look like a card has been placed in a slot */
export function* localPutCardInSlot(
	action: LocalMessageTable[typeof localMessages.GAME_SLOT_PICKED],
	selectedCard: LocalCardInstance,
) {
	let gameState = yield* select(getCopyOfGameState)
	if (!gameState) throw new Error('Can not find game state')

	let playerState = Object.values(gameState?.players || {}).find(
		(player) => player.entity === action.player,
	)
	if (!playerState) throw new Error('Player state not found.')

	let board = playerState?.board
	let slot = action.slotInfo
	if (!board) return

	let row = action.row
	let index = action.index

	if (slot.slotType === 'single_use') {
		board.singleUse = {slot: slot.slotEntity, card: selectedCard}
	}
	if (slot.slotType === 'hermit' && row !== undefined) {
		board.rows[row].hermit = {slot: slot.slotEntity, card: selectedCard as any}
		board.rows[row].health = (
			selectedCard as LocalCardInstance<HasHealth>
		).props.health

		if (!board.activeRow) {
			board.activeRow = board.rows[row].entity
		}

		// If we couldn't before, we can always end our turn after playing a hermit
		gameState.turn.availableActions.push('END_TURN')
	}
	if (slot.slotType === 'attach' && row !== undefined) {
		board.rows[row].attach = {slot: slot.slotEntity, card: selectedCard as any}
	}
	if (slot.slotType === 'item' && row !== undefined && index !== undefined) {
		board.rows[row].items[index] = {
			slot: slot.slotEntity,
			card: selectedCard as any,
		}

		// When we place a item card, lets update the available actions to include what we have enough
		// energy for.
		let hermit = board.rows[row].hermit
		let rowEnergy = board.rows[row].items.flatMap((item) => {
			if (!item.card || !isItem(item.card.props)) return []
			return item.card.props.energy
		})
		if (
			hermit.card &&
			isHermit(hermit.card.props) &&
			isItem(selectedCard.props)
		) {
			if (hasEnoughEnergy(hermit.card.props.primary.cost, rowEnergy, false)) {
				gameState.turn.availableActions.push('PRIMARY_ATTACK')
			}
			if (hasEnoughEnergy(hermit.card.props.secondary.cost, rowEnergy, false)) {
				gameState.turn.availableActions.push('SECONDARY_ATTACK')
			}
		}
	}

	yield* put({type: localMessages.GAME_UPDATE})
}

/** Make the client look like a card has been removed from the hand. */
export function* localRemoveCardFromHand(selectedCard: LocalCardInstance) {
	let localGameState = yield* select(getCopyOfGameState)

	if (!localGameState?.hand) return

	localGameState.hand = localGameState.hand.filter(
		(card) => card.entity !== selectedCard.entity,
	)

	yield* put<LocalMessage>({
		type: localMessages.GAME_UPDATE,
		gameState: localGameState,
	})
}

export function* localApplyEffect() {
	let gameState = yield* select(getCopyOfGameState)
	let playerState = gameState?.players[gameState.playerEntity]

	if (playerState?.board) {
		playerState.board.singleUseCardUsed = true
	}

	yield* put<LocalMessage>({type: localMessages.GAME_UPDATE, gameState})
}

export function* localRemoveEffect() {
	let gameState = yield* select(getCopyOfGameState)
	let playerState = gameState?.players[gameState.playerEntity]

	if (playerState?.board) {
		playerState.board.singleUse = {
			slot: playerState?.board.singleUse.slot,
			card: null,
		}
	}

	yield* put<LocalMessage>({type: localMessages.GAME_UPDATE, gameState})
}

export function* localChangeActiveHermit(action: ChangeActiveHermitActionData) {
	let gameState = yield* select(getCopyOfGameState)
	let playerState = gameState?.players[gameState.playerEntity]

	if (playerState?.board) {
		// Rows are changed by sending a hermit slot.
		for (let row of playerState.board.rows) {
			if (row.hermit.slot === action.entity) {
				playerState.board.activeRow = row.entity
				break
			}
		}
	}

	if (gameState?.turn)
		gameState.turn.availableActions = gameState.turn.availableActions.filter(
			(action) =>
				![
					'SINGLE_USE_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'PLAY_HERMIT_CARD',
					'PLAY_ITEM_CARD',
					'PLAY_EFFECT_CARD',
					'PLAY_SINGLE_USE_CARD',
				].includes(action),
		)

	yield* put<LocalMessage>({type: localMessages.GAME_UPDATE, gameState})
}

/** Make the client look like the turn has ended */
export function* localEndTurn() {
	let gameState = yield* select(getCopyOfGameState)

	if (gameState?.turn) {
		gameState.turn.currentPlayerEntity = gameState?.opponentPlayerEntity
		gameState.turn.turnNumber++
	}

	// When our turn ends we cannot do anything, so lets pretend that we have no actions to have the
	// frontend update properly.
	if (gameState?.turn) gameState.turn.availableActions = []

	// Slots are cleared at the end of the turn
	yield* localRemoveEffect()

	yield* put<LocalMessage>({
		type: localMessages.GAME_UPDATE,
		gameState: gameState,
	})
}
