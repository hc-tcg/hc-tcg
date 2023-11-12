import {useSelector, useDispatch} from 'react-redux'
import {useState} from 'react'
import Modal from 'components/modal'
import CardList from 'components/card-list'
import {CardT} from 'common/types/game-state'
import css from './game-modals.module.scss'
import {getGameState} from 'logic/game/game-selectors'
import {applyEffect, modalRequest, removeEffect} from 'logic/game/game-actions'
import Button from 'components/button'
import {equalCard} from 'common/utils/cards'

const DISABLED = ['clock']

type Props = {
	closeModal: () => void
}
function ChestModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const [selected, setSelected] = useState<CardT | null>(null)
	const discarded: Array<CardT> = useSelector(getGameState)?.discarded || []

	const handleSelection = (newSelected: CardT) => {
		setSelected((current) => (equalCard(current, newSelected) ? null : newSelected))
	}

	const handleClose = () => {
		dispatch(modalRequest({modalResult: {card: null}}))
		closeModal()
	}

	const handleConfirm = () => {
		if (!selected) {
			dispatch(modalRequest({modalResult: {card: null}}))
		} else {
			dispatch(modalRequest({modalResult: {card: selected}}))
		}
		closeModal()
	}

	return (
		<Modal title="Chest" closeModal={handleClose}>
			<div className={css.wrapper}>
				<div className={css.description}>Choose a card to retrieve from your discard pile</div>
				<div className={css.cards}>
					<CardList
						disabled={DISABLED}
						onClick={handleSelection}
						cards={discarded}
						selected={[selected]}
						wrap
						tooltipAboveModal
					/>
				</div>
				<div className={css.options}>
					<Button onClick={handleConfirm} disabled={!selected}>
						Confirm Selection
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ChestModal
