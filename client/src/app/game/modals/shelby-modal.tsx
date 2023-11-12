import Modal from 'components/modal'
import {useDispatch, useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import {modalRequest} from 'logic/game/game-actions'
import {HERMIT_CARDS} from 'common/cards'
import Attack from './attack-modal/attack'
import {getGameState} from 'logic/game/game-selectors'
import {ModalData} from 'common/types/game-state'
import {CardT} from 'common/types/game-state'
import CardList from 'components/card-list'
import Button from 'components/button'

type Props = {
	closeModal: () => void
}
function ShelbyModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const modalData: ModalData | null | undefined = useSelector(getGameState)?.currentModalData
	if (!modalData) return null
	const topCard: CardT = modalData.payload.topCard
	const pile: Array<CardT> = []

	if (topCard) pile.push(topCard)

	const doNothing = () => {
		dispatch(modalRequest({modalResult: {scry: false}}))
		closeModal()
	}

	const placeOnBottom = () => {
		dispatch(modalRequest({modalResult: {scry: true}}))
		closeModal()
	}

	return (
		<Modal closeModal={doNothing} title="Shelby: Place your top card on bottom of deck?">
			<div className={css.confirmModal}>
				<div className={css.cards}>
					<CardList cards={pile} wrap tooltipAboveModal />
				</div>
				<div className={css.options}>
					<Button variant="primary" size="medium" onClick={placeOnBottom}>
						Place on Bottom
					</Button>
					<Button variant="primary" size="medium" onClick={doNothing}>
						Do Nothing
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ShelbyModal
