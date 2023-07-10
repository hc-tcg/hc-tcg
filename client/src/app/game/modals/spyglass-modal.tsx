import {useSelector, useDispatch} from 'react-redux'
import {useState} from 'react'
import Modal from 'components/modal'
import CardList from 'components/card-list'
import {CardT} from 'common/types/game-state'
import css from './spyglass-modal.module.css'
import {getPlayerState} from 'logic/game/game-selectors'
import {followUp} from 'logic/game/game-actions'
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
		dispatch(followUp({modalResult: {card: null}}))
		closeModal()
	}

	const handleConfirm = () => {
		if (selected.length === 1) {
			dispatch(followUp({modalResult: {card: selected[0]}}))
			closeModal()
		}
	}

	return (
		<Modal title={`Spyglass${canDiscard ? `: Select 1 card to discard` : ''}`}>
			<div className={css.wrapper}>
				<div className={css.cards}>
					<CardList onClick={handleSelection} size="small" cards={cards} selected={selected} />
				</div>
				<div className={css.options}>
					<Button variant="primary" size="small" onClick={canDiscard ? handleConfirm : handleClose}>
						{canDiscard ? 'Confirm Selection' : 'Close'}
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default SpyglassModal
