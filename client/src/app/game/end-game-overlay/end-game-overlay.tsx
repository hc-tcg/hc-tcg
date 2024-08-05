import * as Dialog from '@radix-ui/react-dialog'
import cn from 'classnames'
import {GameEndReasonT, GamePlayerEndOutcomeT} from 'common/types/game-state'
import Button from 'components/button'
import {showEndGameOverlay} from 'logic/game/game-actions'
import {getOpponentName} from 'logic/game/game-selectors'
import {useDispatch, useSelector} from 'react-redux'
import css from './end-game-overlay.module.scss'

type Props = {
	outcome?: GamePlayerEndOutcomeT
	reason?: GameEndReasonT
}

const EndGameOverlay = ({outcome, reason}: Props) => {
	const dispatch = useDispatch()
	const opponent = useSelector(getOpponentName)
	let animation
	let winCondition = false
	const closeModal = () => {
		dispatch(showEndGameOverlay(null))
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

	function pointerDownHandler(event: any) {
		event.preventDefault()
	}

	return (
		<Dialog.Root open={!!outcome} onOpenChange={closeModal}>
			<Dialog.Portal container={document.getElementById('modal')}>
				<Dialog.Overlay
					className={cn(css.overlay, {
						[css.win]: winCondition,
					})}
				/>
				<Dialog.Content
					className={css.content}
					onPointerDownOutside={pointerDownHandler}
				>
					<Dialog.Title className={css.title}>
						<img
							src={animation}
							alt="defeat"
							draggable={false}
							className={css.animation}
						/>
					</Dialog.Title>
					<Dialog.Description
						className={cn(css.description, {
							[css.win]: winCondition,
						})}
					>
						{reason && (
							<span>
								{winCondition ? opponent : 'You'} {REASON_MSG[reason]}
							</span>
						)}

						{!reason || (outcome && !['you_won', 'you_lost'].includes(outcome))
							? outcome && OUTCOME_MSG[outcome]
							: null}
						<Dialog.Close asChild>
							<Button>Return to Main Menu</Button>
						</Dialog.Close>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

export default EndGameOverlay
