import {Achievement} from 'common/achievements/types'
import {COSMETICS} from 'common/cosmetics'
import {ProgressionEntry} from 'common/types/achievements'
import css from './achievement.module.scss'
import classNames from 'classnames'

type Props = {
	achievement: Achievement
	progressData: ProgressionEntry | undefined
}
export default function AchievementComponent({
	achievement,
	progressData,
}: Props) {
	const iconCosmetic = COSMETICS[achievement.icon]
	let icon_url = ''
	if (iconCosmetic && iconCosmetic.type === 'title') {
		icon_url = '/images/cosmetics/title.png'
	} else if (iconCosmetic) {
		icon_url = `/images/cosmetics/${iconCosmetic.type}/${iconCosmetic.id}.png`
	}
	const progress = progressData
		? achievement.getProgress(progressData.goals)
		: 0
	const completionTime = progressData?.completionTime

	return (
		<div className={css.achievementContainer}>
			<img
				src={icon_url}
				className={classNames(
					css.icon,
					iconCosmetic && iconCosmetic.type === 'background' && css.rounded,
				)}
			/>
			<div className={css.meat}>
				<div>
					<div>
						{achievement.name}
						<div className={css.achievementDescription}>
							{achievement.description}
						</div>
					</div>
					<div className={css.achievementPlayers}>
						3.5% of players have this achievement
					</div>
				</div>
				<div>
					<div className={css.progressContainer}>
						<div>
							{progress}/{achievement.steps}
						</div>
						<progress
							value={progress}
							max={achievement.steps}
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
		</div>
	)
}
