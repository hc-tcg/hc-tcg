import {CARDS, CARDS_LIST} from 'common/cards'
import {getCardImage, getHermitBackground} from 'common/cards/card'
import {Card, isAttach, isHermit, isItem, isSingleUse} from 'common/cards/types'
import {getDeckFromHash} from 'common/utils/import-export'
import {getCardVisualTokenCost, getDeckCost} from 'common/utils/ranks'
import {ListOfCards} from './schema'
import {joinUrl} from './utils'

type CardResponse = HermitResponse | EffectResponse | ItemResponse

type HermitResponse = {
	category: 'hermit'
	id: string
	name: string
	shortName: string
	expansion: string
	rarity: string
	tokens: number
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
	tokens: number
	description: string
	image: string
}

type ItemResponse = {
	category: 'item'
	id: string
	name: string
	expansion: string
	rarity: string
	tokens: number
	energy: Array<string>
	image: string
}

function cardToCardResponse(card: Card, url: string): CardResponse | null {
	if (isHermit(card)) {
		return {
			category: card.category as any,
			id: card.id,
			name: card.name,
			shortName: card.shortName || card.name,
			expansion: card.expansion,
			rarity: card.rarity,
			tokens: getCardVisualTokenCost(card.tokens),
			type: card.type,
			primary: card.primary,
			secondary: card.secondary,
			image: joinUrl(url, getCardImage(card)),
			background: joinUrl(url, getHermitBackground(card)),
			palette: card.palette,
		}
	} else if (isSingleUse(card) || isAttach(card)) {
		return {
			category: card.category as any,
			id: card.id,
			name: card.name,
			expansion: card.expansion,
			rarity: card.rarity,
			tokens: getCardVisualTokenCost(card.tokens),
			description: card.description,
			image: joinUrl(url, getCardImage(card)),
		}
	} else if (isItem(card)) {
		return {
			category: card.category as any,
			id: card.id,
			name: card.name,
			expansion: card.expansion,
			rarity: card.rarity,
			tokens: getCardVisualTokenCost(card.tokens),
			energy: card.energy,
			image: joinUrl(url, getCardImage(card)),
		}
	}
	return null
}

export function cards(url: string) {
	let out = []

	for (const card of CARDS_LIST) {
		let resp = cardToCardResponse(card, url)
		if (resp) out.push(resp)
	}

	return out
}

export function getCardsInDeck(url: string, hash: string) {
	let deck = getDeckFromHash(hash)
	return deck
		.map((card) => cardToCardResponse(card.props, url))
		.filter((x) => x !== null)
}

export function deckCost(body: Object) {
	let cards = ListOfCards.parse(body)
	return {
		cost: getDeckCost(cards.map((card) => CARDS[card])),
	}
}
