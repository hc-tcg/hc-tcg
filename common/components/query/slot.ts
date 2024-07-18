import {ComponentQuery, card, effect} from '.'
import {CardComponent, RowComponent, SlotComponent, StatusEffectComponent} from '..'
import {CardClass} from '../../cards/base/card'
import {PlayerEntity, RowEntity, SlotEntity} from '../../entities'
import * as query from '.'
import {StatusEffect} from '../../status-effects/status-effect'

/** Return true if the card is attached to the player's side. */
export const currentPlayer: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.player?.entity === game.currentPlayer.entity
}

/** Return true if the card is attached to the opponents side. */
export const opponent: ComponentQuery<SlotComponent> = (game, pos) => {
	return pos.player?.entity === game.opponentPlayer.entity
}

export function player(player: PlayerEntity | null): ComponentQuery<SlotComponent> {
	return (_game, slot) => {
		return slot.player.entity === player
	}
}

/** Return true if the spot is empty. */
export const empty: ComponentQuery<SlotComponent> = (game, pos) => {
	return !game.components.exists(CardComponent, card.slotIs(pos.entity))
}

/** Return true if the card is attached to a hermit slot. */
export const hermit: ComponentQuery<SlotComponent> = (_game, pos) => {
	return pos.type === 'hermit'
}

/** Return true if the card is attached to an effect slot. */
export const attach: ComponentQuery<SlotComponent> = (_game, pos) => {
	return pos.type === 'attach'
}

/** Return true if this slot is the single use slot. */
export const singleUse: ComponentQuery<SlotComponent> = (_game, pos) => {
	return pos.type === 'single_use'
}

/** Return true if the card is attached to an item slot. */
export const item: ComponentQuery<SlotComponent> = (_game, pos) => {
	return pos.type === 'item'
}

/** Return true if the card is attached to the active row. */
export const active: ComponentQuery<SlotComponent> = (_game, pos) => {
	return pos.onBoard() && pos.player?.activeRowEntity === pos.rowEntity
}

/* Return true if the slot is in a player's hand */
export const hand: ComponentQuery<SlotComponent> = (_game, pos) => {
	return pos.type === 'hand'
}

/* Return true if the slot is in a player's hand */
export const deck: ComponentQuery<SlotComponent> = (_game, pos) => {
	return pos.type === 'deck'
}

/* Return true if the slot is in a player's hand */
export const discardPile: ComponentQuery<SlotComponent> = (_game, pos) => {
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

export const playerHasActiveHermit: ComponentQuery<SlotComponent> = (_game, pos) => {
	return pos.player?.activeRowEntity !== null
}

export const opponentHasActiveHermit: ComponentQuery<SlotComponent> = (game, _pos) => {
	return game.opponentPlayer.activeRowEntity !== null
}

export const rowIs = (row: RowEntity | null | undefined): ComponentQuery<SlotComponent> => {
	return (_game, pos) => {
		if (row === null || !pos.onBoard()) return false
		return pos.row?.entity === row
	}
}

export const index = (index: number | null | undefined): ComponentQuery<SlotComponent> => {
	return (_game, pos) => pos.onBoard() && index !== null && pos.index === index
}

export const entity = (entity: SlotEntity | null | undefined): ComponentQuery<SlotComponent> => {
	return (_game, pos) => pos.entity === entity
}

export const has = (...cards: Array<CardClass>): ComponentQuery<SlotComponent> => {
	return (game, pos) => {
		return game.components.exists(CardComponent, card.is(...cards), card.slotIs(pos.entity))
	}
}

/**
 * Returns if a slot is marked as frozen through the `freezeSlots` hook
 * A frozen slot is a slot that can not have card placed in it or removed from it.
 * NOTE: When freezing a slot, do not use the `slot.currentPlayer` combinator.
 * Use slot.player(player.entity) instead.
 */
export const frozen: ComponentQuery<SlotComponent> = (game, pos) => {
	const playerResult = game.currentPlayer.hooks.freezeSlots
		.call()
		.some((result) => result(game, pos))

	const opponentResult = game.opponentPlayer.hooks.freezeSlots
		.call()
		.some((result) => result(game, pos))

	return playerResult || opponentResult
}

export function hasStatusEffect(
	statusEffect: new () => StatusEffect
): ComponentQuery<SlotComponent> {
	return (game, pos) => {
		return game.components.exists(
			StatusEffectComponent,
			effect.is(statusEffect),
			effect.targetIsCardAnd(card.slotIs(pos.entity))
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
