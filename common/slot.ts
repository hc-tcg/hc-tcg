import {CardPosModel} from './models/card-pos-model'
import {GameModel} from './models/game-model'

export type SlotCondition = (game: GameModel, pos: CardPosModel) => boolean

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
		if (pos.player === game.currentPlayer) return true
		return false
	}
	/** Return true if the card is attached to the opponents side. */
	export const opponent: SlotCondition = (game, pos) => {
		if (pos.player === game.opponentPlayer) return true
		return false
	}
	/** Return true if the card is attached to a hermit slot. */
	export const hermitSlot: SlotCondition = (game, pos) => {
		if (pos.slot.type === 'hermit') return true
		return false
	}
	/** Return true if the card is attached to an effect slot. */
	export const effectSlot: SlotCondition = (game, pos) => {
		if (pos.slot.type === 'effect') return true
		return false
	}
	/** Return true if the card is attached to a single use slot. */
	export const singleUseSlot: SlotCondition = (game, pos) => {
		if (pos.slot.type === 'single_use') return true
		return false
	}
	/** Return true if the card is attached to an item slot. */
	export const itemSlot: SlotCondition = (game, pos) => {
		if (pos.slot.type === 'item') return true
		return false
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
}
