import {BasicCardPos, CardPosModel, getCardAtPos} from './models/card-pos-model'
import {GameModel} from './models/game-model'
import {PlayerModel} from './models/player-model'
import {SlotPos} from './types/cards'
import {CardT, PlayerState, RowState} from './types/game-state'
import {PickInfo, SlotInfo} from './types/server-requests'

export type SlotCondition = (game: GameModel, pos: SlotConditionInfo) => boolean

type SlotConditionInfo = {
	player: PlayerState
	slot: SlotInfo
	rowIndex: number | null
	row: RowState | null
	card: CardT | null
}

export function callSlotConditionWithCardPosModel(
	condition: SlotCondition,
	game: GameModel,
	cardPos: CardPosModel
): boolean {
	return condition(game, {
		player: cardPos.player,
		slot: cardPos.slot,
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
	const row = pickInfo.rowIndex ? playerState.board.rows[pickInfo.rowIndex] : null

	return condition(game, {
		player: playerState,
		slot: pickInfo.slot,
		rowIndex: pickInfo.rowIndex || null,
		row: row,
		card: pickInfo.card,
	})
}

export namespace slot {
	/**
	 * Return true if the card is attachable to a slot that fullfills all of the parameters.
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
	 * Return true if the card is attachable to a slot that fullfills any of the parameters.
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

	/** Always return true */
	export const anything: SlotCondition = (game, pos) => {
		return true
	}
	/** Always return false */
	export const nothing: SlotCondition = (game, pos) => {
		return false
	}
	/** Return the opposite of the condition*/
	export const not = (condition: SlotCondition): SlotCondition => {
		return (game, pos) => {
			return condition(game, pos)
		}
	}
	/** Return true if the card is attached to the player's side. */
	export const player: SlotCondition = (game, pos) => {
		return pos.player === game.currentPlayer
	}
	/** Return true if the card is attached to the opponents side. */
	export const opponent: SlotCondition = (game, pos) => {
		return pos.player === game.opponentPlayer
	}
	/** Return true if the card is attached to a hermit slot. */
	export const hermitSlot: SlotCondition = (game, pos) => {
		return pos.slot.type === 'hermit'
	}
	/** Return true if the card is attached to an effect slot. */
	export const effectSlot: SlotCondition = (game, pos) => {
		return pos.slot.type === 'effect'
	}
	/** Return true if the card is attached to a single use slot. */
	export const singleUseSlot: SlotCondition = (game, pos) => {
		return pos.slot.type === 'single_use'
	}
	/** Return true if the card is attached to an item slot. */
	export const itemSlot: SlotCondition = (game, pos) => {
		return pos.slot.type === 'item'
	}
	/** Return true if the card is attached to the active row. */
	export const activeRow: SlotCondition = (game, pos) => {
		return pos.player.board.activeRow === pos.rowIndex
	}
	/** Return true if the spot is empty. */
	export const empty: SlotCondition = (game, pos) => {
		return pos.card === null
	}

	/** Return true if the spot contains a card instance. */
	export const has = (cardId: string): SlotCondition => {
		return (game, pos) => {
			return pos.card !== null && pos.card.cardId === cardId
		}
	}

	export const rowHasHermit: SlotCondition = (game, pos) => {
		return pos.row != null && pos.row.hermitCard != null
	}
}
