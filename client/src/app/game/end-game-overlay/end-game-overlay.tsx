import {useDispatch} from 'react-redux'
import {showEndGameOverlay} from 'logic/game/game-actions'
import {GameEndReasonT} from 'types/game-state'
import css from './end-game-overlay.module.css'

type Props = {
	reason: GameEndReasonT
}

const MESSAGE = {
	client_crash: 'Game client crashed',
	server_crash: 'Server crashed',
	timeout: 'Game timed out (120+ minutes)',
	forfeit_loss: 'You lost the game due to forfeit',
	forfeit_win: 'You won the game due to forfeit',
	leave_win: 'Opponent left the game. You won.',
	leave_loss: 'You left the game. Opponent won.',
	tie: "It's a tie",
	unknown: 'Game ended unexpectedly, please report this on discord',
	you_won: 'You Won',
	you_lost: 'You Lost',
}
const EndGameOverrlay = ({reason}: Props) => {
	const dispatch = useDispatch()
	if (!reason) return null
	const handleClick = () => {
		dispatch(showEndGameOverlay(null))
	}
	return (
		<div className={css.wrapper} onClick={handleClick}>
			<div className={css.message}>
				Game Over
				<br />
				{MESSAGE[reason]}
			</div>
		</div>
	)
}

export default EndGameOverrlay
