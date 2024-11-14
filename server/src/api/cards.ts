import {CARDS, CARDS_LIST} from 'common/cards'
import {getCardTypeIcon, getRankIcon} from 'common/cards/card'
import {getRenderedCardImage} from 'common/cards/card'
import {Card, isAttach, isHermit, isItem, isSingleUse} from 'common/cards/types'
import {getDeckFromHash} from 'common/utils/import-export'
import {getCardVisualTokenCost, getDeckCost} from 'common/utils/ranks'
import root from 'serverRoot'
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
	health: number
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
	images: {
		default: string
		'with-token-cost': string
	}
}

type EffectResponse = {
	category: 'single_use' | 'attach'
	id: string
	name: string
	expansion: string
	rarity: string
	tokens: number
	description: string
	images: {
		default: string
		'with-token-cost': string
	}
}

type ItemResponse = {
	category: 'item'
	id: string
	name: string
	expansion: string
	rarity: string
	tokens: number
	energy: Array<string>
	images: {
		default: string
		'with-token-cost': string
	}
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
			health: card.health,
			primary: card.primary,
			secondary: card.secondary,
			images: {
				default: joinUrl(url, getRenderedCardImage(card, false)),
				'with-token-cost': joinUrl(url, getRenderedCardImage(card, true)),
			},
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
			images: {
				default: joinUrl(url, getRenderedCardImage(card, false)),
				'with-token-cost': joinUrl(url, getRenderedCardImage(card, true)),
			},
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
			images: {
				default: joinUrl(url, getRenderedCardImage(card, false)),
				'with-token-cost': joinUrl(url, getRenderedCardImage(card, true)),
			},
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

export async function getDeckInformation(url: string, hash: string) {
	if (hash.length >= 10) {
		let deck = getDeckFromHash(hash)
		return {
			success: deck
				.map((card) => cardToCardResponse(card.props, url))
				.filter((x) => x !== null),
		}
	} else {
		let deck = await root.db?.getDeckFromID(hash)
		if (!deck)
			return {
				type: 'failure',
				reason: 'Endpoint is unavailable because database is disabled',
			}
		if (deck.type == 'success') {
			return {
				type: 'success',
				...deck.body,
			}
		} else {
			return {
				type: 'failure',
				reason: 'Could not find deck.',
			}
		}
	}
}

export function deckCost(body: Object) {
	let cards = ListOfCards.parse(body)
	return {
		cost: getDeckCost(cards.map((card) => CARDS[card])),
	}
}
export function types(url: string) {
	return [
		{
			type: 'balanced',
			icon: joinUrl(url, getCardTypeIcon('balanced')),
		},
		{
			type: 'builder',
			icon: joinUrl(url, getCardTypeIcon('builder')),
		},
		{
			type: 'speedrunner',
			icon: joinUrl(url, getCardTypeIcon('speedrunner')),
		},
		{
			type: 'redstone',
			icon: joinUrl(url, getCardTypeIcon('redstone')),
		},
		{
			type: 'farm',
			icon: joinUrl(url, getCardTypeIcon('farm')),
		},
		{
			type: 'pvp',
			icon: joinUrl(url, getCardTypeIcon('pvp')),
		},
		{
			type: 'terraform',
			icon: joinUrl(url, getCardTypeIcon('terraform')),
		},
		{
			type: 'prankster',
			icon: joinUrl(url, getCardTypeIcon('prankster')),
		},
		{
			type: 'miner',
			icon: joinUrl(url, getCardTypeIcon('miner')),
		},
		{
			type: 'explorer',
			icon: joinUrl(url, getCardTypeIcon('explorer')),
		},
		{
			type: 'any',
			icon: joinUrl(url, getCardTypeIcon('any')),
		},
	]
}

export function ranks(url: string) {
	return [
		{
			rank: 'stone',
			icon: joinUrl(url, getRankIcon('stone')),
			cost: 0,
		},
		{
			rank: 'iron',
			icon: joinUrl(url, getRankIcon('iron')),
			cost: 1,
		},
		{
			rank: 'gold',
			icon: joinUrl(url, getRankIcon('gold')),
			cost: 2,
		},
		{
			rank: 'emerald',
			icon: joinUrl(url, getRankIcon('emerald')),
			cost: 3,
		},
		{
			rank: 'diamond',
			icon: joinUrl(url, getRankIcon('diamond')),
			cost: 4,
		},
	]
}

export async function getCardStats(
	url: string,
	before: number | null,
	after: number | null,
) {
	let cards = await root.db.getCardsStats({before, after})

	if (cards.type === 'failure') {
		return {
			type: 'failure',
			reason: cards.reason,
		}
	}

	const correctCards = cards.body.map((card) => {
		return {
			...card,
			card: CARDS[card.id.toFixed(0).toString()],
		}
	})

	return {
		success: correctCards.map((card) => ({
			card: CARDS[card.id] ? cardToCardResponse(card.card, url) : null,
			statistics: {
				winrate: card.winrate,
				rarity: card.rarity,
				averageCopies: card.averageCopies,
			},
		})),
	}
}

export async function getDeckStats(
	_url: string,
	before: number | null,
	after: number | null,
	offset: number | null,
	orderBy: 'wins' | 'winrate' | null,
	minimumWins: number | null,
) {
	let decks = await root.db.getDecksStats({
		before: before,
		after: after,
		offset: offset,
		orderBy: orderBy,
		minimumWins: minimumWins,
	})

	if (decks.type === 'failure') {
		return {
			type: 'failure',
			reason: decks.reason,
		}
	}

	return {
		success: decks,
	}
}
