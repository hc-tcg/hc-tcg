import {Achievement} from 'common/achievements/types'
import css from './achievement.module.scss'

type Props = {
    achievement: Achievement,
    progressData: Buffer<ArrayBuffer>,
    completionTime: number | null,
}
export default function AchievementComponent({achievement, progressData, completionTime}: Props) {
    const icon_url = `/images/achievements/${achievement.id}.png`
    const progress = achievement.getProgress(progressData)

    return <div className={css.achievementContainer}>
        <img src={icon_url} className={css.icon}/>
        <div>
            <div>
                {achievement.name}
                <div className={css.achievementDescription}>{achievement.description}</div>
            </div>
            <div className={css.progressContainer}><progress value={progress} max={achievement.steps} className={css.progressBar}></progress><span>{progress}/{achievement.steps}</span></div>
            {completionTime ? <span>Completed: {new Date(completionTime).toLocaleDateString()}</span> : ''}
        </div>
    </div>
}