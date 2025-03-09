import classNames from 'classnames'
import {Achievement} from 'common/achievements/types'
import {ALL_COSMETICS} from 'common/cosmetics'
import {AchievementProgress} from 'common/types/achievements'
import Button from 'components/button'
import {ReactNode} from 'react'
import css from './achievement.module.scss'

type Props = {
	achievement: Achievement
	progressData: AchievementProgress
	hideUnobtained: boolean
	hideObtained: boolean
	filter: string
	setProgressModalText: (children: ReactNode) => void
	setProgressModalOpen: (b: boolean) => void
}
export default function AchievementComponent({
	achievement,
	progressData,
	hideUnobtained,
	hideObtained,
	filter,
	setProgressModalText,
	setProgressModalOpen,
}: Props) {
	const progress =
		(progressData[achievement.numericId] !== undefined
			? achievement.getProgress(progressData[achievement.numericId].goals)
			: 0) || 0

	let out = []

	for (const [i, level] of achievement.levels.entries()) {
		if (hideUnobtained && progress < level.steps) continue
		if (hideObtained && progress >= level.steps) continue
		if (
			!level.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) &&
			!level.description
				.toLocaleLowerCase()
				.includes(filter.toLocaleLowerCase())
		) {
			continue
		}

		const completionTime =
			progressData[achievement.numericId] &&
			progressData[achievement.numericId].levels[i].completionTime
		const iconCosmetic = ALL_COSMETICS.find(
			(x) =>
				x.requires?.achievement === achievement.id &&
				(x.requires.level === i || x.requires.level === undefined),
		)

		const sortedGoals = achievement.getGoals
			? achievement
					.getGoals(progressData[achievement.numericId]?.goals ?? {})
					.sort((a, _b) => (a.complete ? 1 : 0))
			: null

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
			icon = (
				<img
					src={icon_url}
					className={classNames(
						css.icon,
						iconCosmetic && css[iconCosmetic.type],
					)}
				/>
			)
		}

		out.push(
			<div
				className={classNames(
					css.achievementContainer,
					progress >= level.steps && css.completed,
				)}
				key={level.name}
			>
				{icon}
				<div className={css.mainArea}>
					<div className={css.rightSide}>
						<div>
							{progress >= level.steps && (
								<img src={'images/icons/trophy.png'} className={css.trophy} />
							)}
							{level.name}
							<div className={css.achievementDescription}>
								{level.description}
							</div>
						</div>
					</div>
					<div className={css.leftSide}>
						<div className={css.progressContainer}>
							<div>
								{progress}/{level.steps}
							</div>
							<div className={css.progressBar}>
								<div
									className={classNames(
										css.full,
										progress >= level.steps && css.completed,
									)}
									style={{
										width: `${Math.min(progress / level.steps, 1) * 100}%`,
									}}
								></div>
							</div>
							{achievement.getGoals && (
								<Button
									onClick={() => {
										if (!sortedGoals) return
										setProgressModalText(
											<div>
												{sortedGoals.map((goal) => {
													return (
														<div>
															<div>{goal.name}</div>
															{goal.complete === true && <div>Completed</div>}
														</div>
													)
												})}
											</div>,
										)
										setProgressModalOpen(true)
									}}
									className={css.progressButton}
								>
									?
								</Button>
							)}
						</div>
						{completionTime && (
							<div className={css.completionTime}>
								Completed: {new Date(completionTime).toLocaleDateString()}
							</div>
						)}
					</div>
				</div>
			</div>,
		)
	}

	return out
}
