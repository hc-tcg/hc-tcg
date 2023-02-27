import {useDispatch} from 'react-redux'
import {showEndGameOverlay} from 'logic/game/game-actions'
import {GameEndOutcomeT, GameEndReasonT} from 'types/game-state'
import css from './end-game-overlay.module.css'

type Props = {
	outcome: GameEndOutcomeT
	reason: GameEndReasonT
}

const MESSAGE = {
	client_crash: 'Game client crashed',
	server_crash: 'Server crashed',
	timeout: 'Game timeouted out (60+ minutes)',
	forfeit_loss: 'You lost the game due to forfeit',
	forfeit_win: 'You won the game due to forfeit',
	leave_win: 'Opponent left the game. You won.',
	leave_loss: 'You left the game. Opponent won.',
	tie: "It's a tie.",
	unknown: 'Game ended unexpectedly, please report this on discord.',
	you_won: 'You Won.',
	you_lost: 'You Lost.',
}
const WIN_MESSAGE = {
	hermits: 'Opponent lost all hermits.',
	lives: 'Opponent lost all lives.',
	cards: 'Opponent run out of cards.',
	time: 'Opponent run out of time without an active hermit.',
}

const LOSS_MESSAGE = {
	hermits: 'You lost all hermits.',
	lives: 'You lost all lives.',
	cards: 'You run out of cards.',
	time: 'You run out of time without an active hermit.',
}

const EndGameOverrlay = ({outcome, reason}: Props) => {
	const dispatch = useDispatch()
	if (!outcome) return null
	const handleClick = () => {
		dispatch(showEndGameOverlay(null))
	}
	return (
		<div className={css.wrapper} onClick={handleClick}>
			<div className={css.message}>
				{reason && outcome === 'you_won' ? 'You won.' : 'Game Over'}
				<br />
				{reason && outcome === 'you_won' ? (
					<span>{WIN_MESSAGE[reason]}</span>
				) : null}
				{reason && outcome === 'you_lost' ? (
					<span>{LOSS_MESSAGE[reason]}</span>
				) : null}
				{!reason || !['you_won', 'you_lost'].includes(outcome)
					? MESSAGE[outcome]
					: null}
			</div>
		</div>
	)
}

export default EndGameOverrlay
