import classNames from 'classnames'
import {Achievement} from 'common/achievements/types'
import {ALL_COSMETICS} from 'common/cosmetics'
import {AchievementProgress} from 'common/types/achievements'
import css from './achievement.module.scss'

type Props = {
	achievement: Achievement
	progressData: AchievementProgress
}
export default function AchievementComponent({
	achievement,
	progressData,
}: Props) {
	const progress =
		progressData[achievement.numericId] !== undefined
			? achievement.getProgress(progressData[achievement.numericId].goals)
			: 0

	let out = []

	for (const [i, level] of achievement.levels.entries()) {
		const iconCosmetic = ALL_COSMETICS.find(
			(x) =>
				x.requires?.achievement === achievement.id &&
				(x.requires.level === i || !x.requires.level),
		)

		let icon_url = ''

		if (iconCosmetic && iconCosmetic.type === 'title') {
			icon_url = '/images/cosmetics/title.png'
		} else if (iconCosmetic) {
			icon_url = `/images/cosmetics/${iconCosmetic.type}/${iconCosmetic.type === 'background' && iconCosmetic.preview ? iconCosmetic.preview : iconCosmetic.id}.png`
		}

		let icon

		if (iconCosmetic?.type === 'background') {
			icon = (
				<img src={icon_url} className={classNames(css.icon, css.background)} />
			)
		} else if (iconCosmetic?.type === 'coin') {
			const faceStyle = {
				borderColor: `${iconCosmetic.borderColor}`,
				boxShadow: `0 0 2px ${iconCosmetic.borderColor}`,
			}
			icon = (
				<img
					src={icon_url}
					className={classNames(css.icon, css.cosmeticCoin)}
					style={faceStyle}
				/>
			)
		} else {
			icon = <img src={icon_url} className={classNames(css.icon)} />
		}

		const completionTime = 0

		out.push(
			<div className={css.achievementContainer}>
				{icon}
				<div className={css.meat}>
					<div>
						<div>
							{level.name}
							<div className={css.achievementDescription}>
								{level.description}
							</div>
						</div>
						<div className={css.achievementPlayers}>
							3.5% of players have this achievement
						</div>
						<div className={css.progressContainer}>
							<progress
								value={progress}
								max={level.steps}
								className={css.progressBar}
							></progress>
							<span>
								{progress}/{level.steps}
							</span>
						</div>
						{completionTime ? (
							<span>
								Completed: {new Date(completionTime).toLocaleDateString()}
							</span>
						) : (
							''
						)}
					</div>
					<div>
						<div className={css.progressContainer}>
							<div>
								{progress}/{level.steps}
							</div>
							<progress
								value={progress}
								max={level.steps}
								className={css.progressBar}
							></progress>
						</div>
						{completionTime ? (
							<span>
								Completed: {new Date(completionTime).toLocaleDateString()}
							</span>
						) : (
							''
						)}
					</div>
				</div>
			</div>,
		)
	}

	return out
}
