import {useSelector, useDispatch} from 'react-redux'
import {useState} from 'react'
import Modal from 'components/modal'
import CardList from 'components/card-list'
import {CardT} from 'common/types/game-state'
import css from './chest-modal.module.css'
import {equalCard} from 'server/utils'
import {getGameState} from 'logic/game/game-selectors'
import {applyEffect, removeEffect} from 'logic/game/game-actions'

const DISABLED = ['clock']

type Props = {
	closeModal: () => void
}
function ChestModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const [selected, setSelected] = useState<CardT | null>(null)
	const discarded: Array<CardT> = useSelector(getGameState)?.discarded || []

	const handleSelection = (newSelected: CardT) => {
		setSelected((current) =>
			equalCard(current, newSelected) ? null : newSelected
		)
	}

	const handleClose = () => {
		dispatch(removeEffect())
		closeModal()
	}

	const handleConfirm = () => {
		if (!selected) {
			dispatch(removeEffect())
		} else {
			dispatch(applyEffect(selected))
		}
		closeModal()
	}

	return (
		<Modal title="Chest" closeModal={handleClose}>
			<div className={css.wrapper}>
				<div className={css.cards}>
					<CardList
						disabled={DISABLED}
						onClick={handleSelection}
						size="small"
						cards={discarded}
						selected={selected}
					/>
				</div>
				<div className={css.options}>
					<button onClick={handleConfirm}>Confirm Selection</button>
				</div>
			</div>
		</Modal>
	)
}

export default ChestModal
