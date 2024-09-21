import {CARDS_LIST} from 'common/cards'
import {
	Card,
	isAttach,
	isHermit,
	isItem,
	isSingleUse,
} from 'common/cards/base/types'

type CardResponse = HermitResponse | EffectResponse | ItemResponse

type HermitResponse = {
	category: 'hermit'
	id: string
	name: string
	expansion: string
	rarity: string
	tokens: number | string
	type: string
	image: string
	background: string
	palette?: string
	primary: {
		name: string
		cost: Array<string>
		damage: number
		power: string | null
	}
	secondary: {
		name: string
		cost: Array<string>
		damage: number
		power: string | null
	}
}

type EffectResponse = {
	category: 'single_use' | 'attach'
	id: string
	name: string
	expansion: string
	rarity: string
	tokens: number | string
	description: string
	image: string
}

type ItemResponse = {
	category: 'item'
	id: string
	name: string
	expansion: string
	rarity: string
	tokens: number | string
	energy: Array<string>
	image: string
}

function cardToCardResponse(card: Card): CardResponse | null {
	if (isHermit(card)) {
		let background

		if (card.expansion === 'advent_of_tcg') {
			background = '/images/backgrounds/advent_of_tcg.png'
		} else if (
			['alter_egos', 'alter_egos_ii', 'alter_egos_iii'].includes(card.expansion)
		) {
			background = '/images/backgrounds/alter_egos.png'
		} else {
			background = `/images/backgrounds/${card.name.split('-')[0]}.png`
		}

		return {
			category: card.category as any,
			id: card.id,
			name: card.name,
			expansion: card.expansion,
			rarity: card.rarity,
			tokens: card.tokens,
			type: card.type,
			primary: card.primary,
			secondary: card.secondary,
			image: `/images/hermits-nobg/${card.id.split('-')[0]}.png`,
			background,
			palette: card.palette,
		}
	} else if (isSingleUse(card) || isAttach(card)) {
		return {
			category: card.category as any,
			id: card.id,
			name: card.name,
			expansion: card.expansion,
			rarity: card.rarity,
			tokens: card.tokens,
			description: card.description,
			image: `/images/effects/${card.id}.png`,
		}
	} else if (isItem(card)) {
		return {
			category: card.category as any,
			id: card.id,
			name: card.name,
			expansion: card.expansion,
			rarity: card.rarity,
			tokens: card.tokens,
			energy: card.energy,
			image: `/images/effects/${card.id}.png`,
		}
	}
	return null
}

export function cards() {
	let out = []

	for (const card of CARDS_LIST) {
		let resp = cardToCardResponse(card)
		if (resp) out.push(resp)
	}

	return out
}
