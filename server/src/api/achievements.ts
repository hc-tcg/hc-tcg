import root from 'serverRoot'
import {ACHIEVEMENTS_LIST} from 'common/achievements'
import {ALL_COSMETICS} from 'common/cosmetics'
import {Achievement} from 'common/achievements/types'
import {Background, Cosmetic} from 'common/cosmetics/types'

type CosmeticResponse = {
	type: 'title' | 'coin' | 'heart' | 'background' | 'border'
	id: string
	name: string
	image: string
	borderColor?: string
}

type LevelResponse = {
	achievementId: string
	name: string
	description: string
	steps: number
	preview: {image: string; borderColor?: string} | null
}

function achievementToResponseLevels(
	achievement: Achievement,
	url: string,
): LevelResponse[] {
	const levels: LevelResponse[] = []

	for (const [i, level] of achievement.levels.entries()) {
		const iconCosmetic = ALL_COSMETICS.find(
			(x) =>
				x.requires?.achievement === achievement.id &&
				(x.requires.level === i || !x.requires.level),
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
