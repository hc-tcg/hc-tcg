import {isHermit} from 'common/cards/base/types'
import {ModalData} from 'common/types/game-state'
import Modal from 'components/modal'
import {getGameState} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import Attack from './attack-modal/attack'
import css from './game-modals.module.scss'

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

	let isPrimaryAvailable =
		!modalData.blockedActions.includes('PRIMARY_ATTACK')
	let isSecondaryAvailable =
		!modalData.blockedActions.includes('SECONDARY_ATTACK')

	return (
		<Modal closeModal={handleClose} title={modalData.name}>
			<div className={css.confirmModal}>
				<div className={css.description}>
					{modalData.description}
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
