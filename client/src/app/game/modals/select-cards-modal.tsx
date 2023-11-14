import {useSelector, useDispatch} from 'react-redux'
import {useState} from 'react'
import Modal from 'components/modal'
import CardList from 'components/card-list'
import {CardT, ModalData} from 'common/types/game-state'
import css from './game-modals.module.scss'
import {modalRequest} from 'logic/game/game-actions'
import Button from 'components/button'
import {getGameState} from 'logic/game/game-selectors'

type Props = {
	closeModal: () => void
}

function SelectCardsModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const modalData: ModalData | null | undefined = useSelector(getGameState)?.currentModalData
	if (!modalData) return null
	const [selected, setSelected] = useState<Array<CardT>>([])
	const cards: Array<CardT> = modalData.payload.cards
	const selectionSize = modalData.payload.selectionSize

	const handleSelection = (newSelected: CardT) => {
		setSelected((current) => {
			// If a second card is selected then remove the first one
			const newSelection = [...current]
			if (newSelection.length >= selectionSize) {
				newSelection.shift()
			}
			newSelection.push(newSelected)

			return newSelection
		})
	}

	const handleClose = () => {
		dispatch(modalRequest({modalResult: {cards: null}}))
		closeModal()
	}

	const handleConfirm = () => {
		if (selected.length <= 3) {
			dispatch(modalRequest({modalResult: {cards: selected}}))
			closeModal()
		}
	}

	return (
		<Modal title={modalData.payload.modalName} closeModal={handleClose}>
			<div className={css.description}>
				{modalData.payload.modalDescription}
				<div className={css.cards}>
					<CardList
						onClick={handleSelection}
						cards={cards}
						selected={selected}
						wrap
						tooltipAboveModal
					/>
				</div>
			</div>
			<div className={css.options}>
				<Button onClick={handleConfirm}>Confirm Selection</Button>
			</div>
		</Modal>
	)
}

export default SelectCardsModal
