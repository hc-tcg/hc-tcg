import {CardComponent} from '../components'
import {RankT, TypeT} from '../types/cards'
import {DefaultDictionary} from '../types/game-state'
import {getCardRank} from '../utils/ranks'
import {Card, Hermit, isItem} from './types'

export type CanAttachError =
	| 'INVALID_PLAYER'
	| 'INVALID_SLOT'
	| 'UNMET_CONDITION'
	| 'UNMET_CONDITION_SILENT'
	| 'UNKNOWN_ERROR'

export type CanAttachResult = Array<CanAttachError>

/** Type that allows multiple functions in a card to share values. */
export class InstancedValue<T> extends DefaultDictionary<CardComponent, T> {
	public set(component: CardComponent, value: T) {
		this.setValue(component.entity, value)
	}

	public get(component: CardComponent): T {
		return this.getValue(component.entity)
	}

	public clear(component: CardComponent) {
		this.clearValue(component.entity)
	}
}

/** Get the foreground image for a card */
export function getCardImage(card: Card) {
	if (card.category === 'hermit') {
		return `/images/hermits-nobg/${card.id.split('_')[0]}.png`
	}
	if (isItem(card)) {
		return getCardTypeIcon(card.type[0])
	}
	return `/images/effects/${card.id}.png`
}

export function getRenderedCardImage(
	card: Card,
	displayTokenCost: boolean,
	ext: 'webp' | 'png' = 'webp',
) {
	let id = card.id
	if (displayTokenCost) {
		id += '_with_tokens'
	}
	return `/images/cards/${id}.${ext}`
}

export function getCardTypeIcon(type: TypeT) {
	return `/images/types/type-${type}.png`
}

export function getCardRankIcon(card: Card) {
	let rank = getCardRank(card.tokens)
	if (card.tokens === 0 || card.tokens === -1) {
		return null
	}
	return getRankIcon(rank)
}

export function getRankIcon(rank: RankT) {
	return `/images/ranks/${rank}.png`
}

/** Get the background image for a hermit card */
export function getHermitBackground(card: Hermit) {
	if (card.background === 'advent_of_tcg') {
		return '/images/backgrounds/advent_of_tcg.png'
	} else if (card.background === 'advent_of_tcg_ii') {
		return '/images/backgrounds/advent_of_tcg_ii.png'
	} else if (card.background === 'alter_egos') {
		return '/images/backgrounds/alter_egos.png'
	}
	return `/images/backgrounds/${card.id.split('_')[0]}.png`
}
