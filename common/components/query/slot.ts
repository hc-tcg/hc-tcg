import type Card from '../../cards/base/card'
import {ComponentQuery, card, effect, query} from '.'
import {CardComponent, RowComponent, SlotComponent, StatusEffectComponent} from '..'
import {PlayerEntity, RowEntity, SlotEntity, TurnAction} from '../../types/game-state'
import StatusEffect from '../../status-effects/status-effect'

/** Return true if the card is attached to the player's side. */
export const currentPlayer: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.player?.entity === game.currentPlayer.entity
}

/** Return true if the card is attached to the opponents side. */
export const opponent: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.player?.entity === game.opponentPlayer.entity
}

export function player(player: PlayerEntity | null): ComponentQuery<SlotComponent> {
	return (game, slot) => {
		return slot.player.entity === player
	}
}

/** Return true if the spot is empty. */
export const empty: ComponentQuery<SlotComponent> = (game, pos) => {
	return !game.components.exists(CardComponent, card.slotIs(pos.entity))
}

/** Return true if the card is attached to a hermit slot. */
export const hermitSlot: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.type === 'hermit'
}

/** Return true if the card is attached to an effect slot. */
export const attachSlot: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.type === 'attach'
}

/** Return true if this slot is the single use slot. */
export const singleUseSlot: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.type === 'single_use'
}

/** Return true if the card is attached to an item slot. */
export const itemSlot: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.type === 'item'
}

/** Return true if the card is attached to the active row. */
export const activeRow: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.onBoard() && pos.player?.activeRowEntity === pos.rowEntity
}

/* Return true if the slot is in a player's hand */
export const hand: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.type === 'hand'
}

/* Return true if the slot is in a player's hand */
export const deck: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.type === 'deck'
}

/* Return true if the slot is in a player's hand */
export const discardPile: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.type === 'discardPile'
}

export function row(
	...predicates: Array<ComponentQuery<RowComponent>>
): ComponentQuery<SlotComponent> {
	return (game, pos) => {
		if (!pos.onBoard() || pos.row === null) return false
		return query.every(...predicates)(game, pos.row)
	}
}

export const playerHasActiveHermit: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.player?.activeRowEntity !== null
}

export const opponentHasActiveHermit: ComponentQuery<SlotComponent> = (game, pos) => {
	return game.opponentPlayer.activeRowEntity !== null
}

export const rowIs = (row: RowEntity | null | undefined): ComponentQuery<SlotComponent> => {
	return (game, pos) => {
		if (row === null || !pos.onBoard()) return false
		return pos.row?.entity === row
	}
}

export const index = (index: number | null): ComponentQuery<SlotComponent> => {
	return (game, pos) => pos.onBoard() && index !== null && pos.index === index
}

export const entity = (entity: SlotEntity | null): ComponentQuery<SlotComponent> => {
	return (game, pos) => pos.entity === entity
}

/** Return true if the spot contains any of the card IDs. */
export const hasId = (...cardIds: Array<string>): ComponentQuery<SlotComponent> => {
	return (game, pos) => {
		return game.components.exists(CardComponent, card.id(...cardIds), card.slotIs(pos.entity))
	}
}

export const has = (...cards: Array<new () => Card>): ComponentQuery<SlotComponent> => {
	return (game, pos) => {
		return game.components.exists(CardComponent, card.is(...cards), card.slotIs(pos.entity))
	}
}

/**
 * Returns if a slot is marked as frozen through the `freezeSlots` hook
 * A frozen slot is a slot that can not have card placed in it or removed from it.
 */
export const frozen: ComponentQuery<SlotComponent> = (game, pos) => {
	return false
	if (!pos.onBoard()) return true
	if (!pos.row?.index || !pos.type) return false

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

export const actionAvailable = (action: TurnAction): ComponentQuery<SlotComponent> => {
	return (game, pos) => game.state.turn.availableActions.includes(action)
}

export function hasStatusEffect(
	statusEffect: new () => StatusEffect
): ComponentQuery<SlotComponent> {
	return (game, pos) => {
		return game.components.exists(
			StatusEffectComponent,
			effect.is(statusEffect),
			effect.target(card.slotIs(pos.entity))
		)
	}
}

/* *Returns true if an adjacent row to a given slot fulfills the condition given by the predicate. */
export const adjacentTo = (
	predicate: ComponentQuery<SlotComponent>
): ComponentQuery<SlotComponent> => {
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
