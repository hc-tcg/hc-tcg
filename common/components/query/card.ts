import type {PlayerEntity, RowEntity, SlotEntity} from '../../types/game-state'
import {ComponentQuery, effect, query} from '.'
import {CardComponent, RowComponent, SlotComponent, StatusEffectComponent} from '..'
import {slot as slotCombinators} from '.'

export const isHermit: ComponentQuery<CardComponent> = (game, card) => card.isHermit()
export const isAttach: ComponentQuery<CardComponent> = (game, card) => card.isAttach()
export const isItem: ComponentQuery<CardComponent> = (game, card) => card.isItem()
export const isSingleUse: ComponentQuery<CardComponent> = (game, card) => card.isSingleUse()

/** Return true if the card is on the board */
export const attached: ComponentQuery<CardComponent> = (game, card) =>
	card.slot !== null && ['hermit', 'attach', 'item', 'single_use'].includes(card.slot.type)

export function slot(
	...predicates: Array<ComponentQuery<SlotComponent>>
): ComponentQuery<CardComponent> {
	return (game, card) => {
		return card.slot !== null ? query.every(...predicates)(game, card.slot) : null || false
	}
}

export function row(
	...predicates: Array<ComponentQuery<ComponentQuery<RowComponent>>>
): ComponentQuery<CardComponent> {
	return (game, card) => {
		if (!card.slot?.onBoard() || card.slot.row === null) return false
		return card.slot !== null ? query.every(...predicates)(game, card.slot.row) : null || false
	}
}

export function slotIs(slot: SlotEntity | null | undefined): ComponentQuery<CardComponent> {
	return (game, card) => slot !== null && slot !== undefined && slot === card.slot?.entity
}

export function rowIs(row: RowEntity | null): ComponentQuery<CardComponent> {
	return (game, card) => {
		if (!row) return false
		if (!card.slot?.onBoard()) return false
		return row === card.slot?.row?.entity
	}
}

export function player(player: PlayerEntity): ComponentQuery<CardComponent> {
	return (game, card) => {
		return card.playerEntity === player
	}
}

export const currentPlayer: ComponentQuery<CardComponent> = (game, pos) =>
	player(game.currentPlayer.entity)(game, pos)

export const opponentPlayer: ComponentQuery<CardComponent> = (game, pos) =>
	player(game.opponentPlayer.entity)(game, pos)

export function id(...cardIds: Array<string>): ComponentQuery<CardComponent> {
	return (game, card) => cardIds.includes(card.props.id)
}

export const hasStatusEffect = (statusEffect: string): ComponentQuery<CardComponent> => {
	return (game, card) => {
		return game.components.exists(
			StatusEffectComponent,
			effect.id(statusEffect),
			effect.target(card.entity)
		)
	}
}
