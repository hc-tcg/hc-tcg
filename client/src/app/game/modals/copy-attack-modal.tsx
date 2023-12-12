import Modal from 'components/modal'
import {useDispatch, useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import {modalRequest} from 'logic/game/game-actions'
import {HERMIT_CARDS} from 'common/cards'
import Attack from './attack-modal/attack'
import {getGameState} from 'logic/game/game-selectors'
import {ModalData} from 'common/types/game-state'
import {RowPos} from 'common/types/cards'

type Props = {
	closeModal: () => void
}
function CopyAttackModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const modalData: ModalData | null | undefined = useSelector(getGameState)?.currentModalData
	if (!modalData) return null
	const rowPos: RowPos = modalData.payload.cardPos

	if (rowPos.rowIndex === null || !rowPos.row.hermitCard) return null

	const opponentHermitInfo = HERMIT_CARDS[rowPos.row.hermitCard.cardId]

	const hermitFullName = rowPos.row.hermitCard.cardId.split('_')[0]

	const handlePrimary = () => {
		dispatch(modalRequest({modalResult: {pick: 'primary'}}))
		closeModal()
	}

	const handleSecondary = () => {
		dispatch(modalRequest({modalResult: {pick: 'secondary'}}))
		closeModal()
	}

	return (
		<Modal closeModal={handleSecondary} title={modalData.payload.modalName}>
			<div className={css.confirmModal}>
				<div className={css.description}>{modalData.payload.modalDescription}</div>
				<div className={css.description}>
					<Attack
						key="primary"
						name={opponentHermitInfo.primary.name}
						icon={`/images/hermits-nobg/${hermitFullName}.png`}
						attackInfo={opponentHermitInfo.primary}
						onClick={handlePrimary}
					/>
					<Attack
						key="secondary"
						name={opponentHermitInfo.secondary.name}
						icon={`/images/hermits-nobg/${hermitFullName}.png`}
						attackInfo={opponentHermitInfo.secondary}
						onClick={handleSecondary}
					/>
				</div>
			</div>
		</Modal>
	)
}

export default CopyAttackModal
