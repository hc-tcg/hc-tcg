import {isHermit} from 'common/cards/types'
import {ModalData} from 'common/types/game-state'
import {Modal} from 'components/modal'
import {getGameState} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import Attack from './attack-modal/attack'

type Props = {
	closeModal: () => void
}
function CopyAttackModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()

	const modalData: ModalData | null | undefined =
		useSelector(getGameState)?.currentModalData
	if (!modalData || modalData.type !== 'copyAttack') return null

	const opponentHermitInfo = modalData.hermitCard
	if (!isHermit(opponentHermitInfo.props)) return null

	const hermitFullName = opponentHermitInfo.props.id.split('_')[0]

	const handlePrimary = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'MODAL_REQUEST',
				modalResult: {pick: 'primary'},
			},
		})
		closeModal()
	}

	const handleSecondary = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'MODAL_REQUEST',
				modalResult: {pick: 'secondary'},
			},
		})
		closeModal()
	}

	const handleClose = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'MODAL_REQUEST',
				modalResult: {cancel: true},
			},
		})
		closeModal()
	}

	let isPrimaryAvailable = modalData.availableAttacks.includes('primary')
	let isSecondaryAvailable = modalData.availableAttacks.includes('secondary')

	return (
		<Modal
			setOpen
			onClose={handleClose}
			title={modalData.name}
			disableUserClose={!modalData.cancelable}
		>
			<Modal.Description>{modalData.description}</Modal.Description>
			<Modal.Description>
				{isPrimaryAvailable && (
					<Attack
						key="primary"
						name={opponentHermitInfo.props.primary.name}
						icon={`/images/hermits-nobg/${hermitFullName}.png`}
						attackInfo={opponentHermitInfo.props.primary}
						onClick={handlePrimary}
					/>
				)}
				{isSecondaryAvailable && (
					<Attack
						key="secondary"
						name={opponentHermitInfo.props.secondary.name}
						icon={`/images/hermits-nobg/${hermitFullName}.png`}
						attackInfo={opponentHermitInfo.props.secondary}
						onClick={handleSecondary}
					/>
				)}
			</Modal.Description>
		</Modal>
	)
}

export default CopyAttackModal
