import {CardPosModel, getCardAtPos} from './models/card-pos-model'
import {GameModel} from './models/game-model'
import {CardT, PlayerState, RowState} from './types/game-state'
import {PickInfo, PickedSlotType} from './types/server-requests'

export type SlotCondition = (game: GameModel, pos: SlotConditionInfo) => boolean

export type SlotConditionInfo = {
	player: PlayerState
	opponentPlayer: PlayerState
	type: PickedSlotType
	rowIndex: number | null
	row: RowState | null
	card: CardT | null
}

export function getSlotConditionInfo(game: GameModel, cardPos: CardPosModel): SlotConditionInfo {
	return {
		player: cardPos.player,
		opponentPlayer: cardPos.opponentPlayer,
		type: cardPos.slot.type,
		rowIndex: cardPos.rowIndex,
		row: cardPos.row,
		card: getCardAtPos(game, cardPos),
	}
}

export function callSlotConditionWithCardPosModel(
	condition: SlotCondition,
	game: GameModel,
	cardPos: CardPosModel
): boolean {
	return condition(game, {
		player: cardPos.player,
		opponentPlayer: cardPos.opponentPlayer,
		type: cardPos.slot.type,
		rowIndex: cardPos.rowIndex,
		row: cardPos.row,
		card: getCardAtPos(game, cardPos),
	})
}

export function callSlotConditionWithPickInfo(
	condition: SlotCondition,
	game: GameModel,
	pickInfo: PickInfo
): boolean {
	const playerState = game.state.players[pickInfo.playerId]
	const opponentPlayerState = Object.values(game.state.players).filter(
		(state) => state !== playerState
	)[0]
	const row = pickInfo.rowIndex ? playerState.board.rows[pickInfo.rowIndex] : null

	return condition(game, {
		player: playerState,
		opponentPlayer: opponentPlayerState,
		type: pickInfo.slot.type,
		rowIndex: pickInfo.rowIndex !== undefined ? pickInfo.rowIndex : null,
		row: row,
		card: pickInfo.card,
	})
}

export namespace slot {
	/** Always return true */
	export const anything: SlotCondition = (game, pos) => {
		return true
	}

	/** Always return false */
	export const nothing: SlotCondition = (game, pos) => {
		return false
	}

	/**
	 * Return true if the card is attachable to a slot that fulfills all of the parameters.
	 *
	 * ```js
	 * every(player, hermit)
	 * ```
	 *
	 */
	export function every(...options: Array<SlotCondition>): SlotCondition {
		return (game, pos) => {
			return options.reduce((place, combinator) => place && combinator(game, pos), true)
		}
	}

	/**
	 * Return true if the card is attachable to a slot that fulfills any of the parameters.
	 *
	 * ```js
	 * every(opponent, some(effect, item))
	 * ```
	 *
	 */
	export function some(...options: Array<SlotCondition>): SlotCondition {
		return (game, pos) => {
			return options.reduce((place, combinator) => place || combinator(game, pos), false)
		}
	}

	/** Return the opposite of the condition*/
	export const not = (condition: SlotCondition): SlotCondition => {
		return (game, pos) => {
			return !condition(game, pos)
		}
	}

	/** Return true if the card is attached to the player's side. */
	export const player: SlotCondition = (game, pos) => {
		return pos.player.id === game.currentPlayer.id
	}

	/** Return true if the card is attached to the opponents side. */
	export const opponent: SlotCondition = (game, pos) => {
		return pos.player.id === game.opponentPlayer.id
	}

	/** Return true if the spot is empty. */
	export const empty: SlotCondition = (game, pos) => {
		return pos.card === null
	}

	/** Return true if the card is attached to a hermit slot. */
	export const hermitSlot: SlotCondition = (game, pos) => {
		return pos.type === 'hermit'
	}

	/** Return true if the card is attached to an effect slot. */
	export const effectSlot: SlotCondition = (game, pos) => {
		return pos.type === 'effect'
	}

	/** Return true if the card is attached to a single use slot. */
	export const singleUseSlot: SlotCondition = (game, pos) => {
		return pos.type === 'single_use'
	}

	/** Return true if the card is attached to an item slot. */
	export const itemSlot: SlotCondition = (game, pos) => {
		return pos.type === 'item'
	}

	/** Return true if the card is attached to the active row. */
	export const activeRow: SlotCondition = (game, pos) => {
		return pos.player.board.activeRow === pos.rowIndex
	}

	/* Return true if the card is in a player's hand */
	export const hand: SlotCondition = (game, pos) => {
		return [game.currentPlayer, game.opponentPlayer].some((player) => {
			return player.hand.some((card) => card.cardInstance === pos.card?.cardInstance)
		})
	}

	export const rowHasHermit: SlotCondition = (game, pos) => {
		return pos.row !== null && pos.row.hermitCard !== null
	}

	export const playerHasActiveHermit: SlotCondition = (game, pos) => {
		return pos.player.board.activeRow !== undefined
	}

	export const opponentHasActiveHermit: SlotCondition = (game, pos) => {
		return game.opponentPlayer.board.activeRow !== undefined
	}

	export const rowIndex = (rowIndex: number | null): SlotCondition => {
		return (game, pos) => rowIndex !== null && pos.rowIndex === rowIndex
	}

	/** Return true if the spot contains any of the card IDs. */
	export const has = (...cardIds: Array<string>): SlotCondition => {
		return (game, pos) => {
			return cardIds.some((cardId) => {
				return pos.card !== null && pos.card.cardId === cardId
			})
		}
	}

	/**Returns if a card is marked as locked through the `shouldLockSlots` hook*/
	export const locked: SlotCondition = (game, pos) => {
		if (pos.type === 'single_use' || pos.type === 'hand') return true
		if (pos.rowIndex === null || !pos.type) return false

		const playerResult = game.currentPlayer.hooks.shouldLockSlots
			.call()
			.some((result) => result(game, pos))

		pos.player = game.opponentPlayer
		pos.opponentPlayer = game.currentPlayer

		const opponentResult = game.opponentPlayer.hooks.shouldLockSlots
			.call()
			.some((result) => result(game, pos))

		return playerResult || opponentResult
	}

	/** Return true if there is a slot on the board that fullfils the condition given by the predicate */
	export const someSlotFulfills =
		(predicate: SlotCondition): SlotCondition =>
		(game, pos) => {
			return game.someSlotFulfills(predicate)
		}
}
