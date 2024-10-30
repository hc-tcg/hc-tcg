import cn from 'classnames'
import {GameEndReasonT, GamePlayerEndOutcomeT} from 'common/types/game-state'
import Button from 'components/button'
import {getOpponentName} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './end-game-overlay.module.scss'
import {Modal} from 'components/modal'

type Props = {
	outcome?: GamePlayerEndOutcomeT
	reason?: GameEndReasonT | null
}

const EndGameOverlay = ({outcome, reason}: Props) => {
	const dispatch = useMessageDispatch()
	const opponent = useSelector(getOpponentName)
	let animation
	let winCondition = false

	const closeModal = () => {
		dispatch({type: localMessages.GAME_END_OVERLAY_HIDE})
	}

	const OUTCOME_MSG = {
		client_crash: 'Game client crashed',
		server_crash: 'Server crashed',
		timeout: 'Game exceeded time limit (60+ minutes)',
		forfeit_loss: 'You forfeit the game',
		forfeit_win: `${opponent} forfeit the game`,
		leave_win: `${opponent} left the game`,
		leave_loss: `You left the game. ${opponent} won.`,
		tie: 'It`s a tie',
		unknown: 'Game ended unexpectedly, please report this on discord',
		you_won: 'You Won',
		you_lost: 'You Lost',
	}

	const REASON_MSG = {
		hermits: 'lost all hermits.',
		lives: 'lost all lives.',
		cards: 'ran out of cards.',
		time: 'ran out of time without an active hermit.',
		error: 'there was an error',
	}

	switch (outcome) {
		case 'you_won':
		case 'leave_win':
		case 'forfeit_win':
			animation = '/images/animations/victory.gif'
			winCondition = true
			break
		case 'you_lost':
		case 'leave_loss':
		case 'forfeit_loss':
			animation = '/images/animations/defeat.gif'
			break
		default:
			animation = '/images/animations/draw.gif'
	}

	return (
		// 2 Ways to return to the main menu, either press the button, or press ESC
		<Modal
			setOpen={!!outcome}
			onClose={closeModal}
			overlayClassName={cn(css.overlay, winCondition && css.win)}
			disableCloseOnOverlayClick
		>
			<img
				src={animation}
				alt={outcome ? outcome : 'end_game_message'}
				draggable={false}
				className={css.animation}
			/>
			<Modal.Description
				className={cn(css.description, winCondition && css.win)}
			>
				{reason && (
					<span>
						{winCondition ? opponent : 'You'} {REASON_MSG[reason]}
					</span>
				)}

				{!reason || (outcome && !['you_won', 'you_lost'].includes(outcome))
					? outcome && OUTCOME_MSG[outcome]
					: null}
				<Button onClick={closeModal}>Return to Main Menu</Button>
			</Modal.Description>
		</Modal>
	)
}

export default EndGameOverlay
