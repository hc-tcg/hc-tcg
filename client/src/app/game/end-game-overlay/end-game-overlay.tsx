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
	timeout: 'Game timeouted out (60+ minutes)',
	forfeit: 'Player forfeit',
	player_left: 'Player left',
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
