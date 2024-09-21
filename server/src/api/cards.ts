import {CARDS_LIST} from 'common/cards'
import {getCardImage, getHermitBackground} from 'common/cards/base/card'
import {
	Card,
	isAttach,
	isHermit,
	isItem,
	isSingleUse,
} from 'common/cards/base/types'
import {getDeckFromHash} from 'common/utils/import-export'

type CardResponse = HermitResponse | EffectResponse | ItemResponse

type HermitResponse = {
	category: 'hermit'
	id: string
	name: string
	expansion: string
	rarity: string
	tokens: number | string
	type: string
	primary: {
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
	image: string
	background: string
	palette?: string
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
			image: getCardImage(card),
			background: getHermitBackground(card),
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
			image: getCardImage(card),
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
			image: getCardImage(card),
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

export function getCardsInDeck(hash: string) {
	let deck = getDeckFromHash(hash)
	return deck
		.map((card) => cardToCardResponse(card.props))
		.filter((x) => x !== null)
}
