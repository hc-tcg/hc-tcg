import type {PlayerEntity, RowEntity, SlotEntity} from '../../types/game-state'
import {ComponentQuery, query} from '.'
import {CardComponent, RowComponent, SlotComponent} from '../components'
import {slot as slotCombinators} from '.'

export const hermit: ComponentQuery<CardComponent> = (game, card) => card.isHermit()
export const attach: ComponentQuery<CardComponent> = (game, card) => card.isAttach()
export const item: ComponentQuery<CardComponent> = (game, card) => card.isItem()
export const singleUse: ComponentQuery<CardComponent> = (game, card) => card.isSingleUse()

/** Return true if the card is on the board */
export const attached: ComponentQuery<CardComponent> = (game, card) =>
	card.slot !== null && ['hermit', 'attach', 'item', 'single_use'].includes(card.slot.type)

export function slotFulfills(
	...predicates: Array<ComponentQuery<SlotComponent>>
): ComponentQuery<CardComponent> {
	return (game, card) => {
		return card.slot !== null ? query.every(...predicates)(game, card.slot) : null || false
	}
}

export function rowFulfills(
	...predicates: Array<ComponentQuery<ComponentQuery<RowComponent>>>
): ComponentQuery<CardComponent> {
	return (game, card) => {
		if (!card.slot?.onBoard() || card.slot.row === null) return false
		return card.slot !== null ? query.every(...predicates)(game, card.slot.row) : null || false
	}
}

export const pile: ComponentQuery<CardComponent> = slotFulfills(slotCombinators.deck)
export const hand: ComponentQuery<CardComponent> = slotFulfills(slotCombinators.hand)

export function slot(slot: SlotEntity | null | undefined): ComponentQuery<CardComponent> {
	return (game, card) => slot !== null && slot !== undefined && slot === card.slot?.entity
}

export function row(row: RowEntity | null): ComponentQuery<CardComponent> {
	return (game, card) => {
		if (!row) return false
		if (!card.slot?.onBoard()) return false
		return row === card.slot?.row?.entity
	}
}

export function player(player: PlayerEntity): ComponentQuery<CardComponent> {
	return (game, card) => {
		return card.playerId === player
	}
}

export const currentPlayer: ComponentQuery<CardComponent> = (game, pos) =>
	player(game.currentPlayer.entity)(game, pos)

export const opponentPlayer: ComponentQuery<CardComponent> = (game, pos) =>
	player(game.opponentPlayer.entity)(game, pos)

export function id(...cardIds: Array<string>): ComponentQuery<CardComponent> {
	return (game, card) => cardIds.includes(card.props.id)
}
