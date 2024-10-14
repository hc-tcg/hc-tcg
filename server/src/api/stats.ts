import {z} from 'zod'
import {Database, Stats} from 'db/db'

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
	db: Database,
	header: {uuid: string},
): Promise<StatsResult> {
	let stats = await db.getUserStats(header.uuid)

	if (stats.type === 'success') {
		return {
			type: 'success',
			stats: stats.body,
		}
	}

	return {type: 'failure', reason: stats.reason}
}
