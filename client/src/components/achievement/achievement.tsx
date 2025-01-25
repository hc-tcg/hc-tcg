import {Achievement} from 'common/achievements/types'
import css from './achievement.module.scss'
import { ProgressionEntry } from 'common/types/achievements'

type Props = {
	achievement: Achievement
	progressData: ProgressionEntry | undefined
}
export default function AchievementComponent({
	achievement,
	progressData,
}: Props) {
	const icon_url = `/images/achievements/${achievement.id}.png`
	const progress = progressData ? achievement.getProgress(progressData.goals) : 0
	const completionTime = progressData?.completionTime

	return (
		<div className={css.achievementContainer}>
			<img src={icon_url} className={css.icon} />
			<div>
				<div>
					{achievement.name}
					<div className={css.achievementDescription}>
						{achievement.description}
					</div>
				</div>
				<div className={css.progressContainer}>
					<progress
						value={progress}
						max={achievement.steps}
						className={css.progressBar}
					></progress>
					<span>
						{progress}/{achievement.steps}
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
		</div>
	)
}
