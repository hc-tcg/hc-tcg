import type Card from '../../cards/base/card'
import * as query from '.'
import {ComponentQuery} from '.'
import {CardComponent, RowComponent, SlotComponent, StatusEffectComponent} from '..'
import {slot as slotCombinators} from '.'
import {TypeT} from '../../types/cards'
import {CardClass} from '../../cards/base/card'
import {CardEntity, PlayerEntity, RowEntity, SlotEntity} from '../../entities'
import {CardStatusEffect} from '../../status-effects/status-effect'

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

export function slotEntity(slot: SlotEntity | null | undefined): ComponentQuery<CardComponent> {
	return (_game, card) => slot !== null && slot !== undefined && slot === card.slot?.entity
}

export function rowEntity(row: RowEntity | null): ComponentQuery<CardComponent> {
	return (_game, card) => {
		if (!row) return false
		if (!card.slot?.inRow()) return false
		return row === card.slot?.row?.entity
	}
}

export function player(player: PlayerEntity): ComponentQuery<CardComponent> {
	return (_game, card) => {
		return card.player.entity === player
	}
}

export function type(type: TypeT): ComponentQuery<CardComponent> {
	return (_game, card) => card.isHermit() && card.props.type === type
}

export const currentPlayer: ComponentQuery<CardComponent> = (game, pos) =>
	player(game.currentPlayer.entity)(game, pos)

export const opponentPlayer: ComponentQuery<CardComponent> = (game, pos) =>
	player(game.opponentPlayer.entity)(game, pos)

export function is(...cardTypes: Array<CardClass>): ComponentQuery<CardComponent> {
	return (_game, card) =>
		cardTypes.map((t) => CARDS[t.name].props.numericId).includes(card.props.numericId)
}

export function entity(cardEntity: CardEntity): ComponentQuery<CardComponent> {
	return (_game, card) => card.entity == cardEntity
}

/** Return true if this card is on the active row */
export const active: ComponentQuery<CardComponent> = slot(slotCombinators.active)

export const onBoard: ComponentQuery<CardComponent> = (_game, card) => card.slot.onBoard()

/** Return true if this card is not on the active row */
export const afk: ComponentQuery<CardComponent> = query.not(slot(slotCombinators.active))

export const hasStatusEffect = (
	statusEffect: new () => CardStatusEffect
): ComponentQuery<CardComponent> => {
	return (game, card) => {
		return game.components.exists(
			StatusEffectComponent,
			query.effect.is(statusEffect),
			query.effect.targetEntity(card.entity)
		)
	}
}
