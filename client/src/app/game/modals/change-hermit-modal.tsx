import Modal from 'components/modal'
import {useSelector, useDispatch} from 'react-redux'
import {getAvailableActions, getPlayerState} from 'logic/game/game-selectors'
import css from './change-hermit-modal.module.css'
import {PickedSlotT} from 'common/types/pick-process'
import CARDS from 'common/cards'
import Button from 'components/button'

type Props = {
	closeModal: () => void
	info: PickedSlotT
}
function ChangeHermitModal({closeModal, info}: Props) {
	const dispatch = useDispatch()
	const availableActions = useSelector(getAvailableActions)
	const playerState = useSelector(getPlayerState)

	if (info.slot.type !== 'hermit' || !playerState || !info.row) {
		throw new Error('This should never happen')
	}

	const hermitName = info.slot.card?.cardId ? CARDS[info.slot.card.cardId].name : ''
	const row = playerState.board.rows[info.row.index]
	const isKnockedout = row.ailments.some((a) => a.id === 'knockedout')
	const hasActiveHermit = playerState.board.activeRow !== null
	const hasOtherHermits = playerState.board.rows.some(
		(row, index) =>
			row.hermitCard &&
			index !== info.row?.index &&
			!row.ailments.find((a) => a.id === 'knockedout')
	)
	const forbidden = isKnockedout && hasOtherHermits
	const canChange =
		!hasActiveHermit || (!forbidden && availableActions.includes('CHANGE_ACTIVE_HERMIT'))

	let message = `Are you sure you want to activate ${hermitName}?`
	if (forbidden) message = `You can not activate this hermit.`
	else if (!canChange) message = `You can not change your active hermit at this moment.`

	const lastAction = hasActiveHermit && canChange

	const handleYes = () => {
		dispatch({type: 'CONFIRM_HERMIT_CHANGE', payload: true})
		closeModal()
	}

	const handleNo = () => {
		dispatch({type: 'CONFIRM_HERMIT_CHANGE', payload: false})
		closeModal()
	}

	return (
		<Modal title="Change active hermit">
			<div className={css.confirmModal}>
				<div className={css.description}>{message}</div>
				{lastAction && (
					<div className={css.turnEndNotification}>
						<span className={css.infoIcon}>!</span>
						Hermit change is the last action of your turn.
					</div>
				)}
				<div className={css.options}>
					{canChange ? (
						<>
							<Button variant="primary" size="small" onClick={handleYes}>
								Yes
							</Button>
							<Button variant="primary" size="small" onClick={handleNo}>
								No
							</Button>
						</>
					) : (
						<>
							<Button variant="primary" size="small" onClick={handleNo}>
								Ok
							</Button>
						</>
					)}
				</div>
			</div>
		</Modal>
	)
}

export default ChangeHermitModal
