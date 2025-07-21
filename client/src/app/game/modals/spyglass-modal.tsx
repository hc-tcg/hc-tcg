import {ModalData} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import Button from 'components/button'
import CardList from 'components/card-list'
import {Modal} from 'components/modal'
import {
	getGameState,
	getOpponentCardsForSpyglass,
	getStatusEffects,
} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
}

function SpyglasssModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()
	const cards = useSelector(getOpponentCardsForSpyglass)
	const [selected, setSelected] = useState<Array<LocalCardInstance>>([])
	const modalData: ModalData | null | undefined =
		useSelector(getGameState)?.currentModalData
	const statusEffects = useSelector(getStatusEffects)

	useEffect(() => {
		dispatch({type: localMessages.SPYGLASS_REQUEST_CARDS})
	}, [])

	if (!modalData || modalData.type !== 'spyglass') return null

	const maxSelectionSize = 1
	const minSelectionSize = 1
	const cancelable = true

	const canDiscard = modalData.canDiscard

	const handleSelection = (newSelected: LocalCardInstance) => {
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
			title={'Spyglass'}
			onClose={handleClose}
			disableUserClose={!cancelable}
		>
			<Modal.Description>
				{canDiscard && 'Select a card to discard'}
				{cards !== undefined && (
					<div className={css.cards}>
						<div className={css.cardsListContainer}>
							<CardList
								onClick={handleSelection}
								disableAnimations
								statusEffects={statusEffects}
								displayTokenCost={false}
								cards={cards}
								selected={selected}
								wrap={true}
								tooltipAboveModal
							/>
						</div>
					</div>
				)}
				{cards === undefined && 'Loading...'}
			</Modal.Description>
			{canDiscard && (
				<Modal.Options>
					<Button
						variant={'stone'}
						size="medium"
						onClick={handlePrimary}
						disabled={selected.length < minSelectionSize}
					>
						{'Discard'}
					</Button>
				</Modal.Options>
			)}
		</Modal>
	)
}

export default SpyglasssModal
