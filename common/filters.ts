import {GameModel} from './models/game-model'
import {RowComponent, SlotComponent} from './types/cards'
import {
	CardComponent,
	PlayerId,
	RowEntity,
	SlotEntity,
	StatusEffectComponent,
	TurnAction,
} from './types/game-state'

export type Predicate<Value> = (game: GameModel, value: Value) => boolean

export type SlotCondition = Predicate<SlotComponent>
export type CardCondition = Predicate<CardComponent>
export type StatusEffectCondition = Predicate<StatusEffectComponent>

/** Always return true */
function anythingCombinator<T>(game: GameModel, value: T) {
	return true
}

/** Always return false */
function nothingCombinator<T>(game: GameModel, value: T) {
	return false
}

function everyCombinator<T>(...options: Array<Predicate<T>>): Predicate<T> {
	return (game, value) => {
		return options.reduce((place, combinator) => place && combinator(game, value), true)
	}
}

function someCombinator<T>(...options: Array<Predicate<T>>): Predicate<T> {
	return (game, value) => {
		return options.reduce((place, combinator) => place || combinator(game, value), false)
	}
}

function notCombinator<T>(condition: Predicate<T>): Predicate<T> {
	return (game, pos) => {
		return !condition(game, pos)
	}
}

export namespace row {
	export const anything = anythingCombinator
	export const nothing = nothingCombinator
	export const every = everyCombinator
	export const some = someCombinator
	export const not = notCombinator

	export const active: Predicate<RowComponent> = (game, row) =>
		game.activeRow !== null && game.activeRow.entity === row.entity

	export function player(player: PlayerId | null): Predicate<RowComponent> {
		return (game, row) => {
			if (!player) return false
			return row.playerId === player
		}
	}

	export const hasHermit: Predicate<RowComponent> = (game, row) =>
		game.state.cards.somethingFulfills(card.hermit, card.slotFulfills(slot.row(row.entity)))
}

export namespace effect {
	export const anything = anythingCombinator
	export const nothing = nothingCombinator
	export const every = everyCombinator
	export const some = someCombinator
	export const not = notCombinator

	export function id(id: string): Predicate<StatusEffectComponent> {
		return (game, statusEffect) => statusEffect.props.id === id
	}
}

const rowCombinators = row

export namespace slot {
	/** Used for debugging. Print a message provided by the msg function. */
	export const trace = (
		msg: (game: GameModel, pos: SlotComponent, result: boolean) => any,
		combinator: SlotCondition
	): SlotCondition => {
		return (game, pos) => {
			const returnValue = combinator(game, pos)
			console.info(msg(game, pos, returnValue))
			return returnValue
		}
	}

	export const anything = anythingCombinator
	export const nothing = nothingCombinator
	export const every = everyCombinator
	export const some = someCombinator
	export const not = notCombinator

	/** Return true if the card is attached to the player's side. */
	export const currentPlayer: SlotCondition = (game, pos) => {
		return pos.player?.id === game.currentPlayer.id
	}

	/** Return true if the card is attached to the opponents side. */
	export const opponent: SlotCondition = (game, pos) => {
		return pos.player?.id === game.opponentPlayer.id
	}

	export function player(player: PlayerId | null): Predicate<SlotComponent> {
		return (game, slot) => {
			return slot.playerId === player
		}
	}

	/** Return true if the spot is empty. */
	export const empty: SlotCondition = (game, pos) => {
		return !game.state.cards.somethingFulfills(card.slot(pos))
	}

	/** Return true if the card is attached to a hermit slot. */
	export const hermitSlot: SlotCondition = (game, pos) => {
		return pos.type === 'hermit'
	}

	/** Return true if the card is attached to an effect slot. */
	export const attachSlot: SlotCondition = (game, pos) => {
		return pos.type === 'attach'
	}

	/** Return true if this slot is the single use slot. */
	export const singleUseSlot: SlotCondition = (game, pos) => {
		return pos.type === 'single_use'
	}

	/** Return true if the card is attached to an item slot. */
	export const itemSlot: SlotCondition = (game, pos) => {
		return pos.type === 'item'
	}

	/** Return true if the card is attached to the active row. */
	export const activeRow: SlotCondition = (game, pos) => {
		return pos.onBoard() && pos.player?.activeRowId === pos.rowEntity
	}

	/* Return true if the slot is in a player's hand */
	export const hand: SlotCondition = (game, pos) => {
		return pos.type === 'hand'
	}

	/* Return true if the slot is in a player's hand */
	export const pile: SlotCondition = (game, pos) => {
		return pos.type === 'pile'
	}

	/* Return true if the slot is in a player's hand */
	export const discardPile: SlotCondition = (game, pos) => {
		return pos.type === 'discardPile'
	}

	export function rowFulfills(
		...predicates: Array<Predicate<RowComponent>>
	): Predicate<SlotComponent> {
		return (game, pos) => {
			if (!pos.onBoard() || pos.row === null) return false
			return rowCombinators.every(...predicates)(game, pos.row)
		}
	}

	export const playerHasActiveHermit: SlotCondition = (game, pos) => {
		return pos.player?.activeRowId !== null
	}

	export const opponentHasActiveHermit: SlotCondition = (game, pos) => {
		return game.opponentPlayer.activeRowId !== null
	}

	export const row = (row: RowEntity | null | undefined): SlotCondition => {
		return (game, pos) => {
			if (row === null || !pos.onBoard()) return false
			return pos.row?.entity === row
		}
	}

	export const index = (index: number | null): SlotCondition => {
		return (game, pos) => pos.onBoard() && index !== null && pos.index === index
	}

	export const entity = (entity: SlotEntity | null): SlotCondition => {
		return (game, pos) => pos.entity === entity
	}

	/** Return true if the spot contains any of the card IDs. */
	export const hasId = (...cardIds: Array<string>): SlotCondition => {
		return (game, pos) => {
			return game.state.cards.somethingFulfills(card.id(...cardIds), card.slot(pos))
		}
	}

	/** Return true if the hermit in a slot has a certian status effect */
	export const hasStatusEffect = (statusEffect: string): SlotCondition => {
		return (game, pos) => {
			return game.state.statusEffects.somethingFulfills(effect.id(statusEffect))
		}
	}

	/**
	 * Returns if a slot is marked as frozen through the `freezeSlots` hook
	 * A frozen slot is a slot that can not have card placed in it or removed from it.
	 */
	export const frozen: SlotCondition = (game, pos) => {
		if (!pos.onBoard()) return false
		if (pos.row?.index === null || !pos.type) return false

		const playerResult = game.currentPlayer.hooks.freezeSlots
			.call()
			.some((result) => result(game, pos))

		/// Figure out how to redo this
		// pos = {
		// 	...pos,
		// 	player: pos.opponentPlayer,
		// 	opponentPlayer: pos.player,
		// }

		const opponentResult = game.opponentPlayer.hooks.freezeSlots
			.call()
			.some((result) => result(game, pos))

		return playerResult || opponentResult
	}

	export const actionAvailable = (action: TurnAction): SlotCondition => {
		return (game, pos) => game.state.turn.availableActions.includes(action)
	}

	/** Return true if a slot on the board exists that fullfils the condition given by the predicate */
	export const someSlotFulfills =
		(predicate: SlotCondition): SlotCondition =>
		(game, pos) => {
			return game.state.slots.somethingFulfills(predicate)
		}

	/* *Returns true if an adjacent row to a given slot fulfills the condition given by the predicate. */
	export const adjacentTo = (predicate: SlotCondition): SlotCondition => {
		return (game, pos) => {
			if (!pos.onBoard() || pos.row === null) return false
			return (
				game.state.slots.filter(predicate).filter((pickedPos) => {
					if (!pickedPos.onBoard()) return false
					if (pos.row === null || pickedPos.row === null) return false
					return [pos.row.index - 1, pos.row.index + 1].includes(pickedPos.row.index)
				}).length >= 1
			)
		}
	}
}

const slotCombinators = slot

export namespace card {
	export const anything = anythingCombinator
	export const nothing = nothingCombinator
	export const every = everyCombinator
	export const some = someCombinator
	export const not = notCombinator

	export const hermit: CardCondition = (game, card) => card.isHermit()
	export const attach: CardCondition = (game, card) => card.isAttach()
	export const item: CardCondition = (game, card) => card.isItem()
	export const singleUse: CardCondition = (game, card) => card.isSingleUse()

	/** Return true if the card is on the board */
	export const attached: CardCondition = (game, card) =>
		card.slot !== null && ['hermit', 'attach', 'item', 'single_use'].includes(card.slot.type)

	export function slotFulfills(...predicates: Array<SlotCondition>): CardCondition {
		return (game, card) => {
			return card.slot !== null ? everyCombinator(...predicates)(game, card.slot) : null || false
		}
	}

	export const pile: CardCondition = card.slotFulfills(slotCombinators.pile)
	export const hand: CardCondition = card.slotFulfills(slotCombinators.hand)

	export function slot(slot: SlotComponent | null): CardCondition {
		return (game, card) => slot !== null && slot.entity === card.slot?.entity
	}

	export function row(row: RowEntity): CardCondition {
		return (game, card) => {
			if (!card.slot?.onBoard()) return false
			return row === card.slot?.row?.entity
		}
	}

	export function player(player: PlayerId): Predicate<CardComponent> {
		return (game, card) => {
			return card.playerId === player
		}
	}

	export function id(...cardIds: Array<string>): Predicate<CardComponent> {
		return (game, card) => cardIds.includes(card.props.id)
	}
}
