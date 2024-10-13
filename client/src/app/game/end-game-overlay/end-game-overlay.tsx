import * as Dialog from '@radix-ui/react-dialog'
import cn from 'classnames'
import {PlayerEntity} from 'common/entities'
import {GameOutcome, GameVictoryReason} from 'common/types/game-state'
import Button from 'components/button'
import css from './end-game-overlay.module.scss'

type Props = {
	outcome: GameOutcome
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
}

const EndGameOverlay = ({outcome, viewer, onClose, nameOfWinner}: Props) => {
	let animation

	let myOutcome: 'tie' | 'win' | 'loss' = 'tie'

	if (outcome === 'tie') {
		myOutcome = 'tie'
	} else if (viewer.type === 'spectator') {
		myOutcome = 'win'
	} else if (viewer.entity === outcome.winner) {
		myOutcome = 'win'
	} else {
		myOutcome = 'loss'
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

	function pointerDownHandler(event: any) {
		event.preventDefault()
	}

	return (
		<Dialog.Root open={!!outcome} onOpenChange={onClose}>
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
								{myOutcome === 'win' ? nameOfWinner : 'You'}{' '}
								{REASON_MSG[outcome.victoryReason]}
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
