import classNames from 'classnames'
import {Achievement} from 'common/achievements/types'
import {COSMETICS} from 'common/cosmetics'
import {ProgressionEntry} from 'common/types/achievements'
import css from './achievement.module.scss'

type Props = {
	achievement: Achievement
	progressData: ProgressionEntry | undefined
}
export default function AchievementComponent({
	achievement,
	progressData,
}: Props) {
	const progress = progressData
		? achievement.getProgress(progressData.goals)
		: 0

	let out = []

	for (const [i, level] of achievement.levels.entries()) {
		const completionTime = progressData?.levels[i].completionTime
		
		const iconCosmetic = COSMETICS[achievement.levels[i].icon]
		let icon_url = ''
		if (iconCosmetic && iconCosmetic.type === 'title') {
			icon_url = '/images/cosmetics/title.png'
		} else if (iconCosmetic) {
			icon_url = `/images/cosmetics/${iconCosmetic.type}/${iconCosmetic.id}.png`
		}

		out.push(
			<div className={css.achievementContainer}>
				<img
					src={icon_url}
					className={classNames(
						css.icon,
						iconCosmetic && ['background', 'coin'].includes(iconCosmetic.type) && css.rounded,
					)}
				/>
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
