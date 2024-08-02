import {isHermit} from 'common/cards/base/types'
import {ModalData} from 'common/types/game-state'
import Modal from 'components/modal'
import {modalRequest} from 'logic/game/game-actions'
import {getGameState} from 'logic/game/game-selectors'
import {useDispatch, useSelector} from 'react-redux'
import Attack from './attack-modal/attack'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
}
function CopyAttackModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const modalData: ModalData | null | undefined =
		useSelector(getGameState)?.currentModalData
	if (!modalData || modalData.modalId !== 'copyAttack') return null

	const opponentHermitInfo = modalData.payload.hermitCard
	if (!isHermit(opponentHermitInfo.props)) return null

	const hermitFullName = opponentHermitInfo.props.id.split('_')[0]

	const handlePrimary = () => {
		dispatch(modalRequest({modalResult: {pick: 'primary'}}))
		closeModal()
	}

	const handleSecondary = () => {
		dispatch(modalRequest({modalResult: {pick: 'secondary'}}))
		closeModal()
	}

	const handleClose = () => {
		dispatch(modalRequest({modalResult: {cancel: true}}))
		closeModal()
	}

	let isPrimaryAvailable =
		!modalData.payload.blockedActions.includes('PRIMARY_ATTACK')
	let isSecondaryAvailable =
		!modalData.payload.blockedActions.includes('SECONDARY_ATTACK')

	return (
		<Modal closeModal={handleClose} title={modalData.payload.modalName}>
			<div className={css.confirmModal}>
				<div className={css.description}>
					{modalData.payload.modalDescription}
				</div>
				<div className={css.description}>
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
				</div>
			</div>
		</Modal>
	)
}

export default CopyAttackModal
