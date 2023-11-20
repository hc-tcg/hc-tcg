import {useSelector, useDispatch} from 'react-redux'
import {useState} from 'react'
import Modal from 'components/modal'
import CardList from 'components/card-list'
import {CardT} from 'common/types/game-state'
import css from './game-modals.module.scss'
import {getPlayerState} from 'logic/game/game-selectors'
import {customModal} from 'logic/game/game-actions'
import Button from 'components/button'

type Props = {
	closeModal: () => void
}

function SpyglassModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const [selected, setSelected] = useState<Array<CardT>>([])
	const spyglass = useSelector(getPlayerState)?.custom.spyglass
	const cards: Array<CardT> = spyglass.cards
	const canDiscard = spyglass.canDiscard

	const handleSelection = (newSelected: CardT) => {
		if (!canDiscard) return

		setSelected((current) => {
			// If a second card is selected then remove the first one
			const newSelection = [...current]
			if (newSelection.length >= 1) {
				newSelection.shift()
			}
			newSelection.push(newSelected)

			return newSelection
		})
	}

	const handleClose = () => {
		dispatch(customModal({modalResult: {card: null}}))
		closeModal()
	}

	const handleConfirm = () => {
		if (selected.length === 1) {
			dispatch(customModal({modalResult: {card: selected[0]}}))
			closeModal()
		}
	}

	return (
		<Modal
			title={`Spyglass${canDiscard ? `: Select 1 card to discard` : ''}`}
			closeModal={handleClose}
		>
			<div className={css.description}>
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
				<Button onClick={canDiscard ? handleConfirm : handleClose}>
					{canDiscard ? 'Confirm Selection' : 'Close'}
				</Button>
			</div>
		</Modal>
	)
}

export default SpyglassModal
