import {CARDS} from 'common/cards'
import {SlotInfo} from 'common/types/server-requests'
import Button from 'components/button'
import {Modal} from 'components/modal'
import {getAvailableActions, getPlayerState} from 'logic/game/game-selectors'
import {getGameState} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
	info: SlotInfo
}
function ChangeHermitModal({closeModal, info}: Props) {
	const dispatch = useMessageDispatch()
	const availableActions = useSelector(getAvailableActions)
	const playerState = useSelector(getPlayerState)
	const gameState = useSelector(getGameState)

	if (
		info.slotType !== 'hermit' ||
		!playerState ||
		!gameState ||
		info.slotEntity === null
	) {
		throw new Error('This should never happen')
	}

	const hermitName = (info.card && CARDS[info.card.id].name) || ''
	const hasActiveHermit = playerState.board.activeRow !== null
	const canChange =
		!hasActiveHermit || availableActions.includes('CHANGE_ACTIVE_HERMIT')

	let message = `Are you sure you want to activate ${hermitName}?`
	if (!canChange)
		message = 'You can not change your active hermit at this moment.'

	const lastAction = hasActiveHermit && canChange

	const handleYes = () => {
		dispatch({
			type: localMessages.GAME_ACTIONS_HERMIT_CHANGE_CONFIRM,
			confirmed: true,
		})
		closeModal()
	}

	const handleNo = () => {
		dispatch({
			type: localMessages.GAME_ACTIONS_HERMIT_CHANGE_CONFIRM,
			confirmed: false,
		})
		closeModal()
	}

	return (
		<Modal setOpen title="Change active hermit" onClose={handleNo}>
			<Modal.Description>
				{lastAction && (
					<div className={css.turnEndNotification}>
						<span className={css.infoIcon}>!</span>
						<p>Changing your hermit will end your turn!</p>
					</div>
				)}
				{message}
			</Modal.Description>
			<Modal.Options>
				{canChange ? (
					<>
						<Button onClick={handleNo}>Cancel</Button>
						<Button onClick={handleYes}>Yes</Button>
					</>
				) : (
					<>
						<Button onClick={handleNo}>Ok</Button>
					</>
				)}
			</Modal.Options>
		</Modal>
	)
}

export default ChangeHermitModal
