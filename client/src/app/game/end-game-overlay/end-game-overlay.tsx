import cn from 'classnames'
import {CONFIG} from 'common/config'
import {PlayerEntity} from 'common/entities'
import {EarnedAchievement} from 'common/types/achievements'
import {RematchData} from 'common/types/app'
import {GameOutcome, GameVictoryReason} from 'common/types/game-state'
import Button from 'components/button'
import {Modal} from 'components/modal'
import {useEffect, useReducer, useRef, useState} from 'react'
import css from './end-game-overlay.module.scss'

type Props = {
	outcome: GameOutcome
	earnedAchievements: Array<EarnedAchievement>
	gameEndTime: number
	viewer:
		| {
				type: 'player'
				entity: PlayerEntity
		  }
		| {
				type: 'spectator'
		  }
	onClose?: () => void
	nameOfWinner: string | null
	nameOfLoser: string | null
	setMenuSection?: (section: string) => void
	dispatchGameClose?: () => void
	rematchData: RematchData | null
	gameMode: 'public' | 'private' | 'boss'
	// Display fake time to ensure consistency in component tests for visuals
	displayFakeTime?: boolean
}

type SmallAchievementProps = {
	achievement: EarnedAchievement
	index: number
	amount: number
}

const SmallAchievement = ({
	achievement,
	index,
	amount,
}: SmallAchievementProps) => {
	const levelInfo = achievement.level
	const fillRef = useRef<HTMLDivElement>(null)
	const barRef = useRef<HTMLDivElement>(null)
	const [, reload] = useReducer((x) => x + 1, 0)
	const [init, setInit] = useState<boolean>(false)
	const [offset, setOffset] = useState<number>(index)

	const achievementSize = 100
	const leftMargin = 2.5
	const gap = 1

	const setPosition = () => {
		if (!fillRef.current || !barRef.current) return

		setInit(true)

		if (amount !== 1) {
			setOffset(offset <= 0 ? amount - 1 : offset - 1)

			barRef.current?.animate(
				{
					left: [
						`${leftMargin + offset * (achievementSize + gap)}%`,
						`${leftMargin + offset * (achievementSize + gap)}%`,
						`${leftMargin + (offset - 1) * (achievementSize + gap)}%`,
						`${leftMargin + (offset - 1) * (achievementSize + gap)}%`,
					],
					offset: [0.0, 0.8, 0.99, 1.0],
				},
				{
					duration: 5000,
					easing: 'ease-in-out',
					fill: 'forwards',
				},
			)
		}

		if (offset !== 0) return

		const fillAnimation: Record<any, Array<any>> = {
			width: [
				`${100 * (achievement.originalProgress / achievement.level.steps)}%`,
				`${100 * (achievement.newProgress / achievement.level.steps)}%`,
				`${100 * (achievement.newProgress / achievement.level.steps)}%`,
				`${amount === 1 ? 100 * (achievement.newProgress / achievement.level.steps) : 100 * (achievement.originalProgress / achievement.level.steps)}%`,
			],
			offset: [0.0, 0.5, 0.99, 1.0],
		}

		if (amount === 1 && init) return

		if (achievement.newProgress === achievement.level.steps) {
			fillAnimation.backgroundColor = [
				'rgb(86, 184, 208)',
				'rgb(208, 180, 86)',
				'rgb(208, 180, 86)',
				amount !== 1 ? 'rgb(86, 184, 208)' : 'rgb(208, 180, 86)',
			]
		}

		fillRef.current?.animate(fillAnimation, {
			duration: 5000,
			easing: 'ease-in-out',
			fill: 'forwards',
		})
	}

	useEffect(() => {
		const timeout = setInterval(() => {
			setPosition()
		}, 5000)

		return () => {
			clearInterval(timeout)
		}
	})

	if (!init && fillRef && barRef) {
		setPosition()
	} else if (!init) {
		reload()
	}

	return (
		<div
			className={css.smallAchievementBox}
			style={{left: `${leftMargin + index * (achievementSize + gap)}%`}}
			ref={barRef}
		>
			<div className={css.nameAndProgress}>
				<div>{levelInfo.name}</div>
				<div>
					{achievement.newProgress}/{levelInfo.steps}
				</div>
			</div>
			<div className={css.achievementDescription}>{levelInfo.description}</div>
			<div className={css.progressBar}>
				<div
					className={css.full}
					ref={fillRef}
					style={{
						width: `${100 * (achievement.originalProgress / achievement.level.steps)}%`,
					}}
				></div>
			</div>
		</div>
	)
}

const ReplayTimer = ({
	displayFakeTime,
	timerStart,
}: {displayFakeTime: boolean; timerStart: number}) => {
	if (displayFakeTime) {
		return <div className={css.rematchTimeRemaining}>0s</div>
	}

	const timerLength = CONFIG.game.limits.rematchTime

	const [replayTimeRemaining, setReplayTimeRemaining] = useState<number>(
		Math.max(Math.floor((timerStart - Date.now() + timerLength) / 1000), 0),
	)

	useEffect(() => {
		const timeout = setTimeout(() => {
			setReplayTimeRemaining(replayTimeRemaining - 1)
		}, 1000)
		return () => {
			clearTimeout(timeout)
		}
	})

	return (
		<div className={css.rematchTimeRemaining}>
			{replayTimeRemaining > 0 && `${replayTimeRemaining}s`}
		</div>
	)
}

const EndGameOverlay = ({
	outcome,
	earnedAchievements,
	gameEndTime,
	viewer,
	onClose,
	nameOfWinner,
	nameOfLoser,
	setMenuSection,
	dispatchGameClose,
	rematchData,
	gameMode,
	displayFakeTime = false,
}: Props) => {
	const [disableReplay, setDisableReplay] = useState<boolean>(false)

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDisableReplay(true)
		}, rematchData?.time || CONFIG.game.limits.rematchTime)
		return () => {
			clearTimeout(timeout)
		}
	})

	let animation

	let myOutcome: 'tie' | 'win' | 'loss' | 'crash' | 'timeout' | 'no-viewers' =
		'tie'

	if (outcome.type === 'tie') {
		myOutcome = 'tie'
	} else if (outcome.type === 'game-crash') {
		myOutcome = 'crash'
	} else if (outcome.type === 'timeout') {
		myOutcome = 'timeout'
	} else if (outcome.type === 'no-viewers') {
		myOutcome = 'no-viewers'
	} else if (viewer.type === 'spectator') {
		myOutcome = 'win'
	} else if (viewer.entity === outcome.winner) {
		myOutcome = 'win'
	} else {
		myOutcome = 'loss'
	}

	const OUTCOME_MSG = {
		tie: 'It`s a tie',
		win: `${viewer.type === 'spectator' ? nameOfWinner : 'You'} Won`,
		loss: 'You Lost',
		timeout: 'The game timed out.',
		'no-viewers':
			'If an HC-TCG game has nobody watching it, does it still have a winner? Sometimes, but not now.',
		crash:
			'The game crashed. Please copy the crash message and report this to the developers.',
	}

	const NAME_REASON_MSG: Record<GameVictoryReason, string> = {
		'no-hermits-on-board': 'lost all hermits.',
		lives: 'lost all lives.',
		'decked-out': 'ran out of cards.',
		'timeout-without-hermits': 'ran out of time without an active hermit.',
		forfeit: 'forfeit the game.',
		disconnect: 'was disconnected.',
	}

	const YOU_REASON_MSG: Record<GameVictoryReason, string> = {
		...NAME_REASON_MSG,
		disconnect: 'were disconnected.',
	}

	switch (myOutcome) {
		case 'win':
			animation = '/images/animations/victory.gif'
			break
		case 'loss':
			animation = '/images/animations/defeat.gif'
			break
		default:
			animation = '/images/animations/draw.gif'
	}

	const earnedAchievementsAmount = earnedAchievements.filter(
		(a) => a.newProgress >= a.level.steps,
	).length

	const playAgainPage = {
		public: 'play-again-public',
		private: 'play-select-fight',
		boss: 'play-again-boss',
	}

	return (
		// 2 Ways to return to the main menu, either press the button, or press ESC
		<Modal
			setOpen={!!outcome}
			onClose={onClose || (() => {})}
			disableCloseOnOverlayClick
		>
			<img
				src={animation}
				alt={outcome ? outcome.toString() : 'end_game_message'}
				draggable={false}
				className={css.animation}
			/>
			<Modal.Description
				className={cn(css.description, {
					[css.win]: myOutcome === 'win',
				})}
			>
				{outcome.type === 'player-won' ? (
					<span>
						{viewer.type === 'spectator' &&
							nameOfLoser + ' ' + NAME_REASON_MSG[outcome.victoryReason]}
						{viewer.type === 'player' &&
							(myOutcome === 'win'
								? nameOfLoser + ' ' + NAME_REASON_MSG[outcome.victoryReason]
								: 'You ' + YOU_REASON_MSG[outcome.victoryReason])}
					</span>
				) : (
					<span>{OUTCOME_MSG[myOutcome]}</span>
				)}
				<div className={css.achievementsOverview}>
					{earnedAchievements.length > 0 ? (
						<div className={css.achievementsArea}>
							{earnedAchievements.map((a, i) => (
								<SmallAchievement
									achievement={a}
									key={i}
									index={i}
									amount={earnedAchievements.length}
								></SmallAchievement>
							))}
						</div>
					) : (
						<div className={css.noAchievements}>You Earned No Achivements</div>
					)}
				</div>
				{earnedAchievements.length > 0 && (
					<div className={css.achievementCounter}>
						You earned{' '}
						{
							earnedAchievements.filter((a) => a.newProgress >= a.level.steps)
								.length
						}{' '}
						achievement{earnedAchievementsAmount !== 1 && 's'} this game, and
						made progress towards {earnedAchievements.length}.
					</div>
				)}
				{outcome.type === 'game-crash' && (
					<Button
						onClick={() => {
							navigator.clipboard.writeText(outcome.error)
						}}
					>
						Copy Crash Message
					</Button>
				)}

				<div className={css.endOptions}>
					<Button
						id={css.mainMenu}
						onClick={() => {
							setMenuSection && setMenuSection('main-menu')
							dispatchGameClose && dispatchGameClose()
						}}
					>
						Main Menu
					</Button>
					<Button
						id={css.playAgain}
						onClick={() => {
							setMenuSection && setMenuSection(playAgainPage[gameMode])
							dispatchGameClose && dispatchGameClose()
						}}
					>
						Play again
					</Button>
					<Button
						id={css.rematch}
						disabled={disableReplay || !rematchData?.opponentId}
						onClick={() => {
							setMenuSection && setMenuSection('rematch')
							dispatchGameClose && dispatchGameClose()
						}}
					>
						Rematch
						<ReplayTimer
							displayFakeTime={displayFakeTime || !rematchData?.opponentId}
							timerStart={gameEndTime}
						></ReplayTimer>
					</Button>
					<Button id={css.board} onClick={onClose}>
						View Board
					</Button>
				</div>
			</Modal.Description>
		</Modal>
	)
}

export default EndGameOverlay
