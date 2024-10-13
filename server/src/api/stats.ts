import {z} from 'zod'

export const StatsHeader = z.object({uuid: z.string()})

export async function getStats(db: Databse, header: typeof StatsHeader): Stats {


}

