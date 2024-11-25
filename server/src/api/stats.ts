import {CARDS} from 'common/cards'
import {Database} from 'db/db'
import root from 'serverRoot'
import {z} from 'zod'

export const StatsHeader = z.object({uuid: z.string().optional()})

export async function getStats(
	db: Database | undefined,
	uuid?: string,
): Promise<[number, Record<string, any>]> {
	if (!db) {
		return [
			502,
			{
				error: 'Endpoint is unavailable because database is disabled',
			},
		]
	}

	if (!uuid) {
		return [
			400,
			{
				error: '`uuid` query param must be provided for this endpoint',
			},
		]
	}

	let stats = await db.getUserStats(uuid)

	if (stats.type === 'success') {
		return [200, stats.body]
	}

	return [502, {error: stats.reason}]
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
}): Promise<[number, Record<string, any>]> {
	let cards = await root.db.getCardsStats(params)

	if (cards.type === 'failure') {
		return [
			500,
			{
				error: cards.reason,
			},
		]
	}

	return [
		200,
		cards.body.map((card) => ({
			...card,
			id: CARDS[card.id] ? CARDS[card.id].id : null,
		})),
	]
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
}): Promise<[number, Record<string, any>]> {
	let decks = await root.db.getDecksStats(params)

	if (decks.type === 'failure') {
		return [
			500,
			{
				error: decks.reason,
			},
		]
	}

	return [200, decks]
}

export const TypeDistributionStatsQuery = z.object({
	before: z.string().nullish(),
	after: z.string().nullish(),
})

export async function getTypeDistributionStats(params: {
	before: number | null
	after: number | null
}): Promise<[number, Record<string, any>]> {
	let typeDistribution = await root.db.getTypeDistribution(params)

	if (typeDistribution.type === 'failure') {
		return [
			500,
			{
				error: typeDistribution.reason,
			},
		]
	}

	return [200, typeDistribution.body]
}

export const BasicStatsQuery = z.object({
	before: z.string().nullish(),
	after: z.string().nullish(),
})

export async function getGamesStats(params: {
	before: number | null
	after: number | null
}): Promise<[number, Record<string, any>]> {
	let stats = await root.db.getGamesStats(params)

	if (stats.type === 'failure') {
		return [
			500,
			{
				error: stats.reason,
			},
		]
	}

	return [200, stats.body]
}
