import {Stats} from 'common/types/database'
import {Database} from 'db/db'
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
