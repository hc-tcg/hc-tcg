import {useSelector, useDispatch} from 'react-redux'
import {useState} from 'react'
import Modal from 'components/modal'
import {RootState} from 'store'
import CardList from 'components/card-list'
import {CardT} from 'types/game-state'
import css from './chest-modal.module.css'
import {equalCard} from 'server/utils'
import {getPlayerState} from 'logic/game/game-selectors'

import {applyEffect} from 'logic/game/game-actions'

type Props = {
	closeModal: () => void
}
function ChestModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const [selected, setSelected] = useState<CardT | null>(null)
	const discarded: Array<CardT> = useSelector(getPlayerState)?.discarded || []

	const handleSelection = (newSelected: CardT) => {
		setSelected((current) =>
			equalCard(current, newSelected) ? null : newSelected
		)
	}

	const handleConfirm = () => {
		// TODO - if nothing is selected return card to hand
		dispatch(applyEffect(selected))
		closeModal()
	}

	return (
		<Modal title="Chest" closeModal={closeModal}>
			<div className={css.wrapper}>
				<div className={css.cards}>
					<CardList
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
