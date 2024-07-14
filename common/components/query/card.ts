import type {PlayerEntity, RowEntity, SlotEntity} from '../../types/game-state'
import type Card from '../../cards/base/card'
import {ComponentQuery, effect, query} from '.'
import {CardComponent, RowComponent, SlotComponent, StatusEffectComponent} from '..'
import {slot as slotCombinators} from '.'
import StatusEffect from '../../status-effects/status-effect'

let CARDS: Record<string, Card>
import('../../cards').then((mod) => (CARDS = mod.CARDS))

export const isHermit: ComponentQuery<CardComponent> = (_game, card) => card.isHermit()
export const isAttach: ComponentQuery<CardComponent> = (_game, card) => card.isAttach()
export const isItem: ComponentQuery<CardComponent> = (_game, card) => card.isItem()
export const isSingleUse: ComponentQuery<CardComponent> = (_game, card) => card.isSingleUse()

/** Return true if the card is on the board */
export const attached: ComponentQuery<CardComponent> = (_game, card) =>
	card.slot !== null && ['hermit', 'attach', 'item', 'single_use'].includes(card.slot.type)

export function slot(
	...predicates: Array<ComponentQuery<SlotComponent>>
): ComponentQuery<CardComponent> {
	return (game, card) => {
		return card.slot !== null ? query.every(...predicates)(game, card.slot) : null || false
	}
}

export function row(
	...predicates: Array<ComponentQuery<RowComponent>>
): ComponentQuery<CardComponent> {
	return (game, card) => {
		if (!card.slot?.onBoard() || card.slot.row === null) return false
		return card.slot !== null ? query.every(...predicates)(game, card.slot.row) : null || false
	}
}

export function slotIs(slot: SlotEntity | null | undefined): ComponentQuery<CardComponent> {
	return (_game, card) => slot !== null && slot !== undefined && slot === card.slot?.entity
}

export function rowIs(row: RowEntity | null): ComponentQuery<CardComponent> {
	return (_game, card) => {
		if (!row) return false
		if (!card.slot?.onBoard()) return false
		return row === card.slot?.row?.entity
	}
}

export function player(player: PlayerEntity): ComponentQuery<CardComponent> {
	return (_game, card) => {
		return card.player.entity === player
	}
}

export const currentPlayer: ComponentQuery<CardComponent> = (game, pos) =>
	player(game.currentPlayer.entity)(game, pos)

export const opponentPlayer: ComponentQuery<CardComponent> = (game, pos) =>
	player(game.opponentPlayer.entity)(game, pos)

export function id(...cardIds: Array<string>): ComponentQuery<CardComponent> {
	return (_game, card) => cardIds.includes(card.props.id)
}

export function is(...cardTypes: Array<new () => Card>): ComponentQuery<CardComponent> {
	return (_game, card) => cardTypes.map((t) => CARDS[t.name].props.id).includes(card.props.id)
}

/** Return true if this card is on the active row */
export const active: ComponentQuery<CardComponent> = slot(slotCombinators.activeRow)

export const hasStatusEffect = (
	statusEffect: new () => StatusEffect
): ComponentQuery<CardComponent> => {
	return (game, card) => {
		return game.components.exists(
			StatusEffectComponent,
			effect.is(statusEffect),
			effect.targetIs(card.entity)
		)
	}
}
