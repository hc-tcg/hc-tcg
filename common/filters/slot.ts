import {Predicate, card} from '.'
import {CardComponent, SlotComponent} from '../types/components'
import {PlayerComponent, PlayerEntity, TurnAction} from '../types/game-state'

/** Return true if the card is attached to the player's side. */
export const currentPlayer: Predicate<SlotComponent> = (game, pos) => {
	return pos.player?.entity === game.currentPlayer.entity
}

/** Return true if the card is attached to the opponents side. */
export const opponent: Predicate<SlotComponent> = (game, pos) => {
	return pos.player?.entity === game.opponentPlayer.entity
}

export function player(player: PlayerEntity | null): Predicate<SlotComponent> {
	return (game, slot) => {
		return slot.playerId === player
	}
}

/** Return true if the spot is empty. */
export const empty: Predicate<SlotComponent> = (game, pos) => {
	return !game.components.somethingFulfills(CardComponent, card.slot(pos.entity))
}

/** Return true if the card is attached to a hermit slot. */
export const hermitSlot: Predicate<SlotComponent> = (game, pos) => {
	return pos.type === 'hermit'
}

/** Return true if the card is attached to an effect slot. */
export const attachSlot: Predicate<SlotComponent> = (game, pos) => {
	return pos.type === 'attach'
}

/** Return true if this slot is the single use slot. */
export const singleUseSlot: Predicate<SlotComponent> = (game, pos) => {
	return pos.type === 'single_use'
}

/** Return true if the card is attached to an item slot. */
export const itemSlot: Predicate<SlotComponent> = (game, pos) => {
	return pos.type === 'item'
}

/** Return true if the card is attached to the active row. */
export const activeRow: Predicate<SlotComponent> = (game, pos) => {
	return pos.onBoard() && pos.player?.activeRowEntity === pos.rowEntity
}

/* Return true if the slot is in a player's hand */
export const hand: Predicate<SlotComponent> = (game, pos) => {
	return pos.type === 'hand'
}

/* Return true if the slot is in a player's hand */
export const deck: Predicate<SlotComponent> = (game, pos) => {
	return pos.type === 'deck'
}

/* Return true if the slot is in a player's hand */
export const discardPile: Predicate<SlotComponent> = (game, pos) => {
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

export const playerHasActiveHermit: Predicate<SlotComponent> = (game, pos) => {
	return pos.player?.activeRowEntity !== null
}

export const opponentHasActiveHermit: Predicate<SlotComponent> = (game, pos) => {
	return game.opponentPlayer.activeRowEntity !== null
}

export const row = (row: RowEntity | null | undefined): Predicate<SlotComponent> => {
	return (game, pos) => {
		if (row === null || !pos.onBoard()) return false
		return pos.row?.entity === row
	}
}

export const index = (index: number | null): Predicate<SlotComponent> => {
	return (game, pos) => pos.onBoard() && index !== null && pos.index === index
}

export const entity = (entity: SlotEntity | null): Predicate<SlotComponent> => {
	return (game, pos) => pos.entity === entity
}

/** Return true if the spot contains any of the card IDs. */
export const hasId = (...cardIds: Array<string>): Predicate<SlotComponent> => {
	return (game, pos) => {
		return game.state.cards.somethingFulfills(card.id(...cardIds), card.slot(pos.entity))
	}
}

/** Return true if the hermit in a slot has a certian status effect */
export const hasStatusEffect = (statusEffect: string): Predicate<SlotComponent> => {
	return (game, pos) => {
		return game.state.statusEffects.somethingFulfills(effect.id(statusEffect))
	}
}

/**
 * Returns if a slot is marked as frozen through the `freezeSlots` hook
 * A frozen slot is a slot that can not have card placed in it or removed from it.
 */
export const frozen: Predicate<SlotComponent> = (game, pos) => {
	return false
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

export const actionAvailable = (action: TurnAction): Predicate<SlotComponent> => {
	return (game, pos) => game.state.turn.availableActions.includes(action)
}

/** Return true if a slot on the board exists that fullfils the condition given by the predicate */
export const someSlotFulfills =
	(predicate: Predicate<SlotComponent>): Predicate<SlotComponent> =>
	(game, pos) => {
		return game.components.somethingFulfills(SlotComponent, predicate)
	}

/* *Returns true if an adjacent row to a given slot fulfills the condition given by the predicate. */
export const adjacentTo = (predicate: Predicate<SlotComponent>): Predicate<SlotComponent> => {
	return (game, pos) => {
		if (!pos.onBoard() || pos.row === null) return false
		return (
			game.components.filter(SlotComponent, predicate).filter((pickedPos) => {
				if (!pickedPos.onBoard()) return false
				if (pos.row === null || pickedPos.row === null) return false
				return [pos.row.index - 1, pos.row.index + 1].includes(pickedPos.row.index)
			}).length >= 1
		)
	}
}
