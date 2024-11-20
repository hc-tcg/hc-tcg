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
	before: z.string().nullish(),
	after: z.string().nullish(),
	orderBy: z
		.enum(['winrate', 'deckUsage', 'gameUsage', 'averageCopies'])
		.nullish(),
})

export async function getCardStats(params: {
	before: number | null
	after: number | null
	orderBy: 'winrate' | 'deckUsage' | 'gameUsage' | 'averageCopies' | null
}) {
	let cards = await root.db.getCardsStats(params)

	if (cards.type === 'failure') {
		return {
			type: 'failure',
			reason: cards.reason,
		}
	}

	return {
		success: cards.body.map((card) => ({
			...card,
			id: CARDS[card.id] ? CARDS[card.id] : null,
		})),
	}
}

export const DeckStatQuery = z.object({
	before: z.string().nullish(),
	after: z.string().nullish(),
	offset: z.string().nullish(),
	orderBy: z.enum(['wins', 'winrate']).nullish(),
	minimumWins: z.string().nullish(),
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

export const TypeDistributionStatsQuery = z.object({
	before: z.string().nullish(),
	after: z.string().nullish(),
})

export async function getTypeDistributionStats(params: {
	before: number | null
	after: number | null
}) {
	let decks = await root.db.getTypeDistribution(params)
	console.log(decks)

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
