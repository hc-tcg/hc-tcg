import {GameModel} from './models/game-model'
import {BoardSlotInfo, RowInfo, SlotInfo} from './types/cards'
import {CardInstance, PlayerId, StatusEffectInstance, TurnAction} from './types/game-state'

export type Predicate<Value> = (game: GameModel, value: Value) => boolean

export type SlotCondition = Predicate<SlotInfo>
export type CardCondition = Predicate<CardInstance>
export type StatusEffectCondition = Predicate<StatusEffectInstance>

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

export namespace slot {
	/** Used for debugging. Print a message provided by the msg function. */
	export const trace = (
		msg: (game: GameModel, pos: SlotInfo, result: boolean) => any,
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

	export function player(player: PlayerId | null): Predicate<SlotInfo> {
		return (game, slot) => {
			return slot.playerId === player
		}
	}

	/** Return true if the spot is empty. */
	export const empty: SlotCondition = (game, pos) => {
		return !game.state.cards.somethingFulfills(card.inSlot(pos))
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
		return pos.player?.activeRowId === pos.rowId
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

	export const rowHasHermit: SlotCondition = (game, pos) => {
		return !game.state.cards.somethingFulfills(card.hermit, card.slot(slot.row(pos.row)))
	}

	export const playerHasActiveHermit: SlotCondition = (game, pos) => {
		return pos.player?.activeRowId !== null
	}

	export const opponentHasActiveHermit: SlotCondition = (game, pos) => {
		return game.opponentPlayer.activeRowId !== null
	}

	export const row = (row: RowInfo | null): SlotCondition => {
		return (game, pos) => pos.row?.id === row?.id
	}

	export const index = (index: number | null): SlotCondition => {
		return (game, pos) => index !== null && pos.index === index
	}

	/** Return true if the spot contains any of the card IDs. */
	export const hasId = (...cardIds: Array<string>): SlotCondition => {
		return (game, pos) => {
			return cardIds.some((cardId) => {
				return pos.cardId !== null && pos.cardId.card.props.id === cardId
			})
		}
	}

	/** Return true if the hermit in a slot has a certian status effect */
	export const hasStatusEffect = (statusEffect: string): SlotCondition => {
		return (game, pos) => {
			return game.state.statusEffects.some(
				(effect) =>
					effect.targetInstance.instance == pos.cardId?.instance && effect.props.id == statusEffect
			)
		}
	}

	/**
	 * Returns if a slot is marked as frozen through the `freezeSlots` hook
	 * A frozen slot is a slot that can not have card placed in it or removed from it.
	 */
	export const frozen: SlotCondition = (game, pos) => {
		if (pos.type === 'single_use' || pos.type === 'hand') return false
		if (pos.rowIndex === null || !pos.type) return false

		const playerResult = game.currentPlayer.hooks.freezeSlots
			.call()
			.some((result) => result(game, pos))

		pos = {
			...pos,
			player: pos.opponentPlayer,
			opponentPlayer: pos.player,
		}

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
			return game.someSlotFulfills(predicate)
		}

	/* *Returns true if an adjacent row to a given slot fulfills the condition given by the predicate. */
	export const adjacentTo = (predicate: SlotCondition): SlotCondition => {
		return (game, pos) => {
			if (pos.row === null) return false
			return (
				game.state.slots.filter(predicate).filter((pickedPos) => {
					if (pos.row === null || pickedPos.row === null) return false
					return [pos.row.index - 1, pos.row.index + 1].includes(pickedPos.row.index)
				}).length >= 1
			)
		}
	}
}

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

	export function slot(...predicates: Array<SlotCondition>): CardCondition {
		return (game, card) => {
			return card.slot !== null ? everyCombinator(...predicates)(game, card.slot) : null || false
		}
	}

	export function inSlot(slot: SlotInfo): CardCondition {
		return (game, card) => slot.id === card.slot?.id
	}

	export function inRow(row: RowInfo): CardCondition {
		return (game, card) => {
			row.id === card.slot?.row?.id
		}
	}

	export function player(player: PlayerId): Predicate<CardInstance> {
		return (game, card) => {
			return card.playerId === player
		}
	}
}

export namespace row {
	export const anything = anythingCombinator
	export const nothing = nothingCombinator
	export const every = everyCombinator
	export const some = someCombinator
	export const not = notCombinator

	export const active: Predicate<RowInfo> = (game, row) =>
		game.activeRow !== null && game.activeRow.id === row.id

	export function player(player: PlayerId): Predicate<RowInfo> {
		return (game, row) => {
			return row.playerId === player
		}
	}
}
