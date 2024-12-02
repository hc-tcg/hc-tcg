import {HasHealth, isHermit, isItem} from 'common/cards/types'
import {LocalCardInstance} from 'common/types/server-requests'
import {ChangeActiveHermitActionData} from 'common/types/turn-action-data'
import {hasEnoughEnergy} from 'common/utils/attacks'
import {LocalMessageTable, localMessages} from 'logic/messages'
import {put, select} from 'typed-redux-saga'
import {getGameState, getPlayerState} from './game-selectors'

// This file has routines to force the client to update before a message is recieved from the server.

/** Make the client look like a card has been placed in a slot */
export function* localPutCardInSlot(
	action: LocalMessageTable[typeof localMessages.GAME_SLOT_PICKED],
	selectedCard: LocalCardInstance,
) {
	let gameState = yield* select(getGameState)
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

	if (slot.slotType === 'single_use' && board.singleUse.card === null) {
		board.singleUse = {slot: slot.slotEntity, card: selectedCard}
	}
	if (
		slot.slotType === 'hermit' &&
		row !== undefined &&
		board.rows[row].hermit.card === null
	) {
		board.rows[row].hermit = {slot: slot.slotEntity, card: selectedCard as any}
		board.rows[row].health = (
			selectedCard as LocalCardInstance<HasHealth>
		).props.health

		if (!board.activeRow) {
			board.activeRow = board.rows[row].entity
		}

		// If we couldn't before, we can always end our turn after playing a hermit
		gameState.turn.availableActions.push('END_TURN')
		yield* localRemoveCardFromHand(selectedCard)
	}
	if (
		slot.slotType === 'attach' &&
		row !== undefined &&
		board.rows[row].attach.card === null
	) {
		board.rows[row].attach = {slot: slot.slotEntity, card: selectedCard as any}
		yield* localRemoveCardFromHand(selectedCard)
	}
	if (
		slot.slotType === 'item' &&
		row !== undefined &&
		index !== undefined &&
		board.rows[row].items[index].card === null
	) {
		board.rows[row].items[index] = {
			slot: slot.slotEntity,
			card: selectedCard as any,
		}
		yield* localRemoveCardFromHand(selectedCard)

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
			if (
				hasEnoughEnergy(hermit.card.props.primary.cost, rowEnergy, false) &&
				!hermit.card.props.primary.passive
			) {
				gameState.turn.availableActions.push('PRIMARY_ATTACK')
			}
			if (
				hasEnoughEnergy(hermit.card.props.secondary.cost, rowEnergy, false) &&
				!hermit.card.props.secondary.passive
			) {
				gameState.turn.availableActions.push('SECONDARY_ATTACK')
			}
		}
	}

	yield* put({type: localMessages.GAME_UPDATE})
}

/** Make the client look like a card has been removed from the hand. */
export function* localRemoveCardFromHand(selectedCard: LocalCardInstance) {
	let localPlayerState = yield* select(getGameState)

	if (!localPlayerState?.hand) return

	localPlayerState.hand = localPlayerState.hand.filter(
		(card) => card.entity !== selectedCard.entity,
	)

	yield* put({type: localMessages.GAME_UPDATE})
}

export function* localApplyEffect() {
	let playerState = yield* select(getPlayerState)

	if (playerState?.board) {
		playerState.board.singleUseCardUsed = true
	}

	yield* put({type: localMessages.GAME_UPDATE})
}

export function* localRemoveEffect() {
	let playerState = yield* select(getPlayerState)

	if (playerState?.board) {
		playerState.board.singleUse = {
			slot: playerState?.board.singleUse.slot,
			card: null,
		}
	}

	yield* put({type: localMessages.GAME_UPDATE})
}

export function* localChangeActiveHermit(action: ChangeActiveHermitActionData) {
	let playerState = yield* select(getPlayerState)
	let gameState = yield* select(getGameState)

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

	yield* put({type: localMessages.GAME_UPDATE})
}

/** Make the client look like the turn has ended */
export function* localEndTurn() {
	let localPlayerState = yield* select(getGameState)
	if (localPlayerState?.turn) {
		localPlayerState.turn.currentPlayerEntity =
			localPlayerState?.opponentPlayerEntity
		localPlayerState.turn.turnNumber++
	}

	// When our turn ends we cannot do anything, so lets pretend that we have no actions to have the
	// frontend update properly.
	if (localPlayerState?.turn) localPlayerState.turn.availableActions = []

	// Slots are cleared at the end of the turn
	yield* localRemoveEffect()

	yield* put({type: localMessages.GAME_UPDATE})
}
