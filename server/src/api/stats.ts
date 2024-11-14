import {CARDS} from 'common/cards'
import {Stats} from 'common/types/database'
import {Database} from 'db/db'
import root from 'serverRoot'
import {z} from 'zod'

type StatsResult =
	| {
			type: 'success'
			stats: Stats
	  }
	| {
			type: 'failure'
			reason?: string
	  }

export const StatsHeader = z.object({uuid: z.string()})

export async function getStats(
	db: Database | undefined,
	header: {uuid: string},
): Promise<StatsResult> {
	if (!db) {
		return {
			type: 'failure',
			reason: 'Endpoint is unavailable because database is disabled',
		}
	}

	let stats = await db.getUserStats(header.uuid)

	if (stats.type === 'success') {
		return {
			type: 'success',
			stats: stats.body,
		}
	}

	return {type: 'failure', reason: stats.reason}
}

export const CardStatsQuery = z.object({
	url: z.string(),
	before: z.nullable(z.number()),
	after: z.nullable(z.number()),
})

export async function getCardStats(params: {
	before: number | null
	after: number | null
}) {
	let cards = await root.db.getCardsStats(params)

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
			card: card.id,
			statistics: {
				winrate: card.winrate,
				rarity: card.rarity,
				averageCopies: card.averageCopies,
			},
		})),
	}
}

export const DeckStatParams = z.object({
	before: z.nullable(z.number()),
	after: z.nullable(z.number()),
	offset: z.nullable(z.number()),
	orderBy: z.nullable(z.enum(['wins', 'winrate'])),
	minimumWins: z.nullable(z.number()),
})

export async function getDeckStats(params: {
	before: number | null
	after: number | null
	offset: number | null
	orderBy: 'wins' | 'winrate' | null
	minimumWins: number | null
}) {
	let decks = await root.db.getDecksStats(params)

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
