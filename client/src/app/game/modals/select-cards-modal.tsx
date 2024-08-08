import {ModalData} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import Button from 'components/button'
import CardList from 'components/card-list'
import Modal from 'components/modal'
import {getGameState} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
}

function SelectCardsModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()

	const modalData: ModalData | null | undefined =
		useSelector(getGameState)?.currentModalData
	if (!modalData || modalData.modalId !== 'selectCards') return null
	const [selected, setSelected] = useState<Array<LocalCardInstance>>([])
	const cards: Array<LocalCardInstance> = modalData.payload.cards
	const selectionSize = modalData.payload.selectionSize
	const primaryButton = modalData.payload.primaryButton
	const secondaryButton = modalData.payload.secondaryButton

	const handleSelection = (newSelected: LocalCardInstance) => {
		if (selectionSize === 0) return

		setSelected((current) => {
			const newSelection = [...current]
			// Remove a card if it is clicked on when selected
			if (selected.includes(newSelected)) {
				return newSelection.filter((card) => card.entity !== newSelected.entity)
			}
			// If a new card is selected then remove the first one
			if (newSelection.length >= selectionSize) {
				newSelection.shift()
			}
			newSelection.push(newSelected)

			return newSelection
		})
	}

	const handlePrimary = () => {
		if (selectionSize === 0) {
			dispatch({
				type: localMessages.GAME_MODAL_REQUEST,
				modalResult: {result: true, cards: null},
			})
			closeModal()
			return
		}
		if (selected.length <= selectionSize) {
			dispatch({
				type: localMessages.GAME_MODAL_REQUEST,
				modalResult: {
					result: true,
					cards: selected.map((card) => card.entity),
				},
			})
			closeModal()
		}
	}

	const handleClose = () => {
		dispatch({
			type: localMessages.GAME_MODAL_REQUEST,
			modalResult: {result: false, cards: null},
		})
		closeModal()
	}

	return (
		<Modal title={modalData.payload.modalName} closeModal={handleClose}>
			<div className={css.description}>
				{modalData.payload.modalDescription}
				{cards.length > 0 && (
					<div className={css.cards}>
						<div className={css.cardsListContainer}>
							<CardList
								onClick={handleSelection}
								cards={cards}
								selected={selected}
								wrap={true}
								tooltipAboveModal
								disableAnimations
							/>
						</div>
					</div>
				)}
			</div>
			<div className={css.options}>
				{secondaryButton && (
					<Button
						variant={secondaryButton.variant}
						size="medium"
						onClick={handleClose}
					>
						{secondaryButton.text}
					</Button>
				)}
				{primaryButton && (
					<Button
						variant={primaryButton.variant}
						size="medium"
						onClick={handlePrimary}
					>
						{primaryButton.text}
					</Button>
				)}
			</div>
		</Modal>
	)
}

export default SelectCardsModal
