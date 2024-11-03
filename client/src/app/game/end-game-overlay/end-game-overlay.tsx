import cn from 'classnames'
import {PlayerEntity} from 'common/entities'
import {GameOutcome, GameVictoryReason} from 'common/types/game-state'
import Button from 'components/button'
import {Modal} from 'components/modal'
import {getOpponentName} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
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
	nameOfLoser: string | null
}

const EndGameOverlay = ({
	outcome,
	viewer,
	onClose,
	nameOfWinner,
	nameOfLoser,
}: Props) => {
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
		win: `${viewer.type === 'spectator' ? nameOfWinner : 'You'} Won`,
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

	return (
		// 2 Ways to return to the main menu, either press the button, or press ESC
		<Modal
			setOpen={!!outcome}
			onClose={onClose || (() => {})}
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
