import {useSelector, useDispatch} from 'react-redux'
import {useState} from 'react'
import Modal from 'components/modal'
import CardList from 'components/card-list'
import {CardT} from 'common/types/game-state'
import css from './looting-modal.module.css'
import {getPlayerState} from 'logic/game/game-selectors'
import {followUp} from 'logic/game/game-actions'
import Button from 'components/button'

type Props = {
	closeModal: () => void
}

function LootingModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const [selected, setSelected] = useState<Array<CardT>>([])
	const looting = useSelector(getPlayerState)?.custom.looting
	const cards: Array<CardT> = looting.cards

	const handleSelection = (newSelected: CardT) => {
		setSelected((current) => {
			// If a third card is selected then remove the first one
			const newSelection = [...current]
			if (newSelection.length >= 2) {
				newSelection.shift()
			}
			newSelection.push(newSelected)

			return newSelection
		})
	}

	const handleConfirm = () => {
		// The opponent may have 1 item card
		if (selected.length === 1 || selected.length === 2) {
			dispatch(followUp({modalResult: {cards: selected}}))
			closeModal()
		}
	}

	return (
		<Modal
			closeModal={handleConfirm}
			title={`Looting: Select ${cards.length === 1 ? '1 card' : '2 cards'} to steal`}
		>
			<div className={css.wrapper}>
				<div className={css.cards}>
					<CardList onClick={handleSelection} cards={cards} selected={selected} />
				</div>
				<div className={css.options}>
					<Button variant="primary" size="small" onClick={handleConfirm}>
						Confirm Selection
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default LootingModal
