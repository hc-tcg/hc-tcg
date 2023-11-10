import Modal from 'components/modal'
import {useDispatch, useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import {modalRequest} from 'logic/game/game-actions'
import {HERMIT_CARDS} from 'common/cards'
import Attack from './attack-modal/attack'
import {getGameState} from 'logic/game/game-selectors'
import {PickResult} from 'common/types/server-requests'

type Props = {
	closeModal: () => void
}
function CopyAttackModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const pickedSlot: PickResult | null | undefined = useSelector(getGameState)?.currentModalPick

	if (!pickedSlot?.rowIndex || !pickedSlot.card) return null

	const opponentHermitInfo = HERMIT_CARDS[pickedSlot.card.cardId]

	const hermitFullName = pickedSlot.card.cardId.split('_')[0]

	const handlePrimary = () => {
		dispatch(modalRequest({modalResult: {pick: 'primary'}}))
		closeModal()
	}

	const handleSecondary = () => {
		dispatch(modalRequest({modalResult: {pick: 'secondary'}}))
		closeModal()
	}

	return (
		<Modal closeModal={handleSecondary} title="Choose an attack to copy">
			<div className={css.confirmModal}>
				<div className={css.description}>Which of the Hermit's attacks do you want to copy?</div>
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
