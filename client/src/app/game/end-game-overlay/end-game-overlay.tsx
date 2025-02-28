import cn from 'classnames'
import serverConfig from 'common/config/server-config'
import {PlayerEntity} from 'common/entities'
import {EarnedAchievement} from 'common/types/achievements'
import {GameOutcome, GameVictoryReason} from 'common/types/game-state'
import Button from 'components/button'
import {Modal} from 'components/modal'
import {localMessages} from 'logic/messages'
import {useEffect, useReducer, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import css from './end-game-overlay.module.scss'

type Props = {
	outcome: GameOutcome
	earnedAchievements: Array<EarnedAchievement>
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
	setMenuSection: (section: string) => void
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

	const gap = 1

	const setPosition = () => {
		if (!fillRef.current || !barRef.current) return

		setInit(true)

		if (amount !== 1) {
			setOffset(offset <= 0 ? amount - 1 : offset - 1)

			barRef.current?.animate(
				{
					left: [
						`${12.5 + offset * (75 + gap)}%`,
						`${12.5 + offset * (75 + gap)}%`,
						`${12.5 + (offset - 1) * (75 + gap)}%`,
						`${12.5 + (offset - 1) * (75 + gap)}%`,
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
				'rgb(121, 208, 86)',
				'rgb(121, 208, 86)',
				'rgb(86, 184, 208)',
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
			style={{left: `${12.5 + index * (75 + gap)}%`}}
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

const ReplayTimer = ({}: {}) => {
	const [replayTimeRemaining, setReplayTimeRemaining] = useState<number>(
		serverConfig.limits.rematchTime / 1000 - 1,
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
	viewer,
	onClose,
	nameOfWinner,
	nameOfLoser,
	setMenuSection,
}: Props) => {
	const dispatch = useDispatch()

	const [disableReplay, setDisableReplay] = useState<boolean>(false)

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDisableReplay(true)
		}, serverConfig.limits.rematchTime)
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

	const REASON_MSG: Record<GameVictoryReason, string> = {
		'no-hermits-on-board': 'lost all hermits.',
		lives: 'lost all lives.',
		'decked-out': 'ran out of cards.',
		'timeout-without-hermits': 'ran out of time without an active hermit.',
		forfeit: 'forfeit the game.',
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
						{viewer.type === 'spectator' && nameOfLoser}
						{viewer.type === 'player' &&
							(myOutcome === 'win' ? nameOfLoser : 'You')}{' '}
						{REASON_MSG[outcome.victoryReason]}
					</span>
				) : (
					<span>{OUTCOME_MSG[myOutcome]}</span>
				)}
				<div className={css.achievementsOverview}>
					{earnedAchievements.length > 0 ? (
						earnedAchievements.map((a, i) => (
							<SmallAchievement
								achievement={a}
								key={i}
								index={i}
								amount={earnedAchievements.length}
							></SmallAchievement>
						))
					) : (
						<div className={css.noAchievements}>You Earned No Achivements</div>
					)}
				</div>
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
							setMenuSection('main-menu')
							dispatch({type: localMessages.GAME_CLOSE})
						}}
					>
						Main Menu
					</Button>
					<Button
						id={css.playAgain}
						onClick={() => {
							setMenuSection('play-again')
							dispatch({type: localMessages.GAME_CLOSE})
						}}
					>
						Play again
					</Button>
					<Button
						id={css.rematch}
						disabled={disableReplay}
						onClick={() => {
							setMenuSection('rematch')
							dispatch({type: localMessages.GAME_CLOSE})
						}}
					>
						Rematch
						<ReplayTimer></ReplayTimer>
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
