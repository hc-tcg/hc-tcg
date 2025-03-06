import {ACHIEVEMENTS, ACHIEVEMENTS_LIST} from 'common/achievements'
import {Achievement} from 'common/achievements/types'
import {ALL_COSMETICS} from 'common/cosmetics'
import root from 'serverRoot'
import {z} from 'zod'

type LevelResponse = {
	achievementId: string
	name: string
	description: string
	steps: number
	preview: {image: string; borderColor?: string} | null
	index: number
	maxIndex: number
}

function achievementToResponseLevels(
	achievement: Achievement,
	url: string,
): LevelResponse[] {
	const levels: LevelResponse[] = []

	const levelCount = achievement.levels.length

	for (const [i, level] of achievement.levels.entries()) {
		const iconCosmetic = ALL_COSMETICS.find(
			(x) =>
				x.requires?.achievement === achievement.id &&
				(x.requires.level === i || x.requires.level === undefined),
		)

		let icon_url = ''

		if (iconCosmetic && iconCosmetic.type === 'title') {
			icon_url = `${url}/images/cosmetics/title.png`
		} else if (iconCosmetic) {
			icon_url = `${url}/images/cosmetics/${iconCosmetic.type}/${iconCosmetic.type === 'background' && iconCosmetic.preview ? iconCosmetic.preview : iconCosmetic.id}.png`
		}

		levels.push({
			achievementId: achievement.id,
			preview: iconCosmetic
				? {
						image: icon_url,
						borderColor:
							iconCosmetic.type === 'coin'
								? iconCosmetic.borderColor
								: undefined,
					}
				: null,
			index: i,
			maxIndex: levelCount,
			...level,
		})
	}

	return levels
}

export function achievements(url: string) {
	return ACHIEVEMENTS_LIST.flatMap((achievement) =>
		achievementToResponseLevels(achievement, url),
	)
}

export const PlayerAchievementProgressQuery = z.object({
	achievementId: z.string().nullish(),
	uuid: z.string().nullish(),
})

export async function playerProgress(
	achievementId: string,
	player: string,
): Promise<[number, Record<string, any>]> {
	const achievement = ACHIEVEMENTS[achievementId]
	if (!root.db?.connected)
		return [
			501,
			{
				reason: 'Endpoint is unavailable because database is disabled',
			},
		]
	let progress = await root.db?.getPlayerAchievementProgress(
		achievement,
		player,
	)

	if (progress.type === 'failure') {
		return [
			500,
			{
				reason: progress.reason,
			},
		]
	}
	return [200, progress.body]
}

export async function overallAchievementProgress(
	achievementId: string,
	level: number,
): Promise<[number, Record<string, any>]> {
	const achievement = ACHIEVEMENTS[achievementId]
	if (!achievement)
		return [
			404,
			{
				reason: 'Achievement not found',
			},
		]
	if (level >= achievement.levels.length)
		return [
			404,
			{
				reason: 'Level not found',
			},
		]
	if (!root.db?.connected)
		return [
			501,
			{
				reason: 'Endpoint is unavailable because database is disabled',
			},
		]
	let progress = await root.db?.getAchievementPercentageCompletion(
		achievement,
		level,
	)

	if (progress.type === 'failure') {
		return [
			500,
			{
				reason: progress.reason,
			},
		]
	}
	return [200, progress.body]
}
