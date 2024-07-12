import type {PlayerEntity, RowEntity, SlotEntity} from '../types/game-state'
import {Predicate, query} from '.'
import {CardComponent, RowComponent, SlotComponent} from '../types/components'
import {slot as slotCombinators} from '.'

export const hermit: Predicate<CardComponent> = (game, card) => card.isHermit()
export const attach: Predicate<CardComponent> = (game, card) => card.isAttach()
export const item: Predicate<CardComponent> = (game, card) => card.isItem()
export const singleUse: Predicate<CardComponent> = (game, card) => card.isSingleUse()

/** Return true if the card is on the board */
export const attached: Predicate<CardComponent> = (game, card) =>
	card.slot !== null && ['hermit', 'attach', 'item', 'single_use'].includes(card.slot.type)

export function slotFulfills(
	...predicates: Array<Predicate<SlotComponent>>
): Predicate<CardComponent> {
	return (game, card) => {
		return card.slot !== null ? query.every(...predicates)(game, card.slot) : null || false
	}
}

export function rowFulfills(
	...predicates: Array<Predicate<Predicate<RowComponent>>>
): Predicate<CardComponent> {
	return (game, card) => {
		if (!card.slot?.onBoard() || card.slot.row === null) return false
		return card.slot !== null ? query.every(...predicates)(game, card.slot.row) : null || false
	}
}

export const pile: Predicate<CardComponent> = slotFulfills(slotCombinators.deck)
export const hand: Predicate<CardComponent> = slotFulfills(slotCombinators.hand)

export function slot(slot: SlotEntity | null | undefined): Predicate<CardComponent> {
	return (game, card) => slot !== null && slot !== undefined && slot === card.slot?.entity
}

export function row(row: RowEntity | null): Predicate<CardComponent> {
	return (game, card) => {
		if (!row) return false
		if (!card.slot?.onBoard()) return false
		return row === card.slot?.row?.entity
	}
}

export function player(player: PlayerEntity): Predicate<CardComponent> {
	return (game, card) => {
		return card.playerId === player
	}
}

export const currentPlayer: Predicate<CardComponent> = (game, pos) =>
	player(game.currentPlayer.entity)(game, pos)

export const opponentPlayer: Predicate<CardComponent> = (game, pos) =>
	player(game.opponentPlayer.entity)(game, pos)

export function id(...cardIds: Array<string>): Predicate<CardComponent> {
	return (game, card) => cardIds.includes(card.props.id)
}
