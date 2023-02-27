import Modal from 'components/modal'
import {useSelector, useDispatch} from 'react-redux'
import {getAvailableActions, getPlayerState} from 'logic/game/game-selectors'
import css from './change-hermit-modal.module.css'
import {PickedCardT} from 'types/pick-process'
import {CardInfoT} from 'types/cards'
import CARDS from 'server/cards'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

type Props = {
	closeModal: () => void
	info: PickedCardT
}
function ChangeHermitModal({closeModal, info}: Props) {
	const dispatch = useDispatch()
	const availableActions = useSelector(getAvailableActions)
	const playerState = useSelector(getPlayerState)

	if (info.slotType !== 'hermit' || !playerState) {
		throw new Error('This should never happen')
	}

	const hermitName = info.card?.cardId ? TYPED_CARDS[info.card.cardId].name : ''
	const row = playerState.board.rows[info.rowIndex]
	const isKnockedout = row.ailments.some((a) => a.id === 'knockedout')
	const hasActiveHermit = playerState.board.activeRow !== null
	const hasOtherHermits = playerState.board.rows.some(
		(row, index) => row.hermitCard && index !== info.rowIndex
	)
	const forbidden = isKnockedout && hasOtherHermits
	const canChange =
		!forbidden && availableActions.includes('CHANGE_ACTIVE_HERMIT')

	let message = `Are you sure you want to activate ${hermitName}?`
	if (forbidden) message = `You can not activate this hermit.`
	else if (!canChange)
		message = `You can not not change your active hermit at this moment.`

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
							<button onClick={handleYes}>Yes</button>
							<button onClick={handleNo}>No</button>
						</>
					) : (
						<>
							<button onClick={handleNo}>Ok</button>
						</>
					)}
				</div>
			</div>
		</Modal>
	)
}

export default ChangeHermitModal
