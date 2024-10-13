import * as Dialog from '@radix-ui/react-dialog'
import cn from 'classnames'
import {GameOutcome, GameVictoryReason} from 'common/types/game-state'
import Button from 'components/button'
import {
	getGame,
	getOpponentName,
	getPlayerEntity,
} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './end-game-overlay.module.scss'

const EndGameOverlay = ({outcome}: {outcome: GameOutcome}) => {
	const dispatch = useMessageDispatch()
	const opponent = useSelector(getOpponentName)
	const entity = useSelector(getPlayerEntity)
	const turnNumber = useSelector(getGame).localGameState?.turn.turnNumber
	let animation

	let myOutcome: 'tie' | 'win' | 'loss' = 'tie'

	if (outcome === 'tie') {
		myOutcome = 'tie'
	} else if (entity === outcome.winner) {
		myOutcome = 'win'
	} else {
		myOutcome = 'loss'
	}

	const closeModal = () => {
		dispatch({type: localMessages.GAME_END_OVERLAY_HIDE})
	}

	const OUTCOME_MSG = {
		tie: 'It`s a tie',
		win: 'You Won',
		loss: 'You Lost',
	}

	const REASON_MSG: Record<GameVictoryReason, string> = {
		'no-hermits-on-board': 'lost all hermits.',
		lives: 'lost all lives.',
		'decked-out': 'ran out of cards.',
		forfeit: 'forfeit the game.',
	}
	function getReason(reason: GameVictoryReason) {
		if (reason === 'no-hermits-on-board' && turnNumber && turnNumber <= 2) {
			return 'ran out of time without an active hermit.'
		}
		return REASON_MSG[reason]
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

	function pointerDownHandler(event: any) {
		event.preventDefault()
	}

	return (
		<Dialog.Root open={!!outcome} onOpenChange={closeModal}>
			<Dialog.Portal container={document.getElementById('modal')}>
				<Dialog.Overlay
					className={cn(css.overlay, {
						[css.win]: myOutcome === 'win',
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
							[css.win]: myOutcome === 'win',
						})}
					>
						{outcome !== 'tie' && (
							<span>
								{myOutcome === 'win' ? opponent : 'You'}{' '}
								{getReason(outcome.victoryReason)}
							</span>
						)}

						{OUTCOME_MSG[myOutcome]}
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
