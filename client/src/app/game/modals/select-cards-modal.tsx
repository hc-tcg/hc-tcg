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
	const secondaryButton = modalData.payload.secondaryButton
	const canSelect = selectionSize.length > 0

	const handleSelection = (newSelected: CardT) => {
		if (selectionSize === 0) return
		setSelected((current) => {
			// If a new card is selected then remove the first one
			const newSelection = [...current]
			if (newSelection.length >= selectionSize) {
				newSelection.shift()
			}
			newSelection.push(newSelected)

			return newSelection
		})
	}

	const handlePrimary = () => {
		if (selectionSize === 0) {
			dispatch(modalRequest({modalResult: {result: true, cards: null}}))
			closeModal()
			return
		}
		if (selected.length <= selectionSize) {
			dispatch(modalRequest({modalResult: {result: true, cards: selected}}))
			closeModal()
		}
	}

	const handleClose = () => {
		dispatch(modalRequest({modalResult: {result: false, cards: null}}))
		closeModal()
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
				<Button
					variant={modalData.payload.primaryButton.variant}
					size="medium"
					onClick={handlePrimary}
				>
					{modalData.payload.primaryButton.text}
				</Button>
				{secondaryButton && (
					<Button variant={secondaryButton.variant} size="medium" onClick={handleClose}>
						{secondaryButton.text}
					</Button>
				)}
			</div>
		</Modal>
	)
}

export default SelectCardsModal
