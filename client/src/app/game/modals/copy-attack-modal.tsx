import {CARDS} from 'common/cards'
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

	const opponentHermitInfo = CARDS[modalData.hermitCard.id]
	if (!isHermit(opponentHermitInfo)) return null

	const hermitFullName = CARDS[opponentHermitInfo.id].id.split('_')[0]

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
						name={opponentHermitInfo.primary.name}
						icon={`/images/hermits-nobg/${hermitFullName}.png`}
						attackInfo={opponentHermitInfo.primary}
						onClick={handlePrimary}
					/>
				)}
				{isSecondaryAvailable && (
					<Attack
						key="secondary"
						name={opponentHermitInfo.secondary.name}
						icon={`/images/hermits-nobg/${hermitFullName}.png`}
						attackInfo={opponentHermitInfo.secondary}
						onClick={handleSecondary}
					/>
				)}
			</Modal.Description>
		</Modal>
	)
}

export default CopyAttackModal
