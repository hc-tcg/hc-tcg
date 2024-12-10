import {ModalData} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import Button from 'components/button'
import CardList from 'components/card-list'
import {Modal} from 'components/modal'
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
	if (!modalData || modalData.type !== 'selectCards') return null
	const [selected, setSelected] = useState<Array<LocalCardInstance>>([])
	const cards: Array<LocalCardInstance> = modalData.cards
	const maxSelectionSize = Array.isArray(modalData.selectionSize)
		? modalData.selectionSize[1]
		: modalData.selectionSize
	const minSelectionSize = Array.isArray(modalData.selectionSize)
		? modalData.selectionSize[0]
		: modalData.selectionSize
	const primaryButton = modalData.primaryButton
	const secondaryButton = modalData.secondaryButton
	const cancelable = modalData.cancelable

	const handleSelection = (newSelected: LocalCardInstance) => {
		if (maxSelectionSize === 0) return

		setSelected((current) => {
			const newSelection = [...current]
			// Remove a card if it is clicked on when selected
			if (selected.includes(newSelected)) {
				return newSelection.filter((card) => card.entity !== newSelected.entity)
			}
			// If a new card is selected then remove the first one
			if (newSelection.length >= maxSelectionSize) {
				newSelection.shift()
			}
			newSelection.push(newSelected)

			return newSelection
		})
	}

	const handlePrimary = () => {
		if (maxSelectionSize === 0) {
			dispatch({
				type: localMessages.GAME_TURN_ACTION,
				action: {
					type: 'MODAL_REQUEST',
					modalResult: {result: true, cards: null},
				},
			})
			closeModal()
			return
		}

		if (selected.length <= maxSelectionSize) {
			dispatch({
				type: localMessages.GAME_TURN_ACTION,
				action: {
					type: 'MODAL_REQUEST',
					modalResult: {
						result: true,
						cards: selected.map((card) => card.entity),
					},
				},
			})
			closeModal()
		}
	}

	const handleClose = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'MODAL_REQUEST',
				modalResult: {result: false, cards: null},
			},
		})
		closeModal()
	}

	return (
		<Modal
			setOpen
			title={modalData.name}
			onClose={handleClose}
			disableUserClose={!cancelable}
		>
			<Modal.Description>
				{modalData.description}
				{cards.length > 0 && (
					<div className={css.cards}>
						<div className={css.cardsListContainer}>
							<CardList
								onClick={handleSelection}
								displayTokenCost={false}
								cards={cards}
								selected={selected}
								wrap={true}
								tooltipAboveModal
								disableAnimations
								statusEffects={useSelector(getGameState)?.statusEffects}
							/>
						</div>
					</div>
				)}
			</Modal.Description>
			<Modal.Options>
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
						disabled={selected.length < minSelectionSize}
					>
						{primaryButton.text}
					</Button>
				)}
			</Modal.Options>
		</Modal>
	)
}

export default SelectCardsModal
