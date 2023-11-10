import Modal from 'components/modal'
import {useDispatch, useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import Button from 'components/button'
import {customModal} from 'logic/game/game-actions'
import CardList from 'components/card-list'
import {getGameState} from 'logic/game/game-selectors'
import {CardT} from 'common/types/game-state'

type Props = {
	closeModal: () => void
}
function ShelbyModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const topCard: CardT | null | undefined = useSelector(getGameState)?.topCard
	const pile: Array<CardT> = []

	if (topCard) pile.push(topCard)

	const doNothing = () => {
		dispatch(customModal({modalResult: {scry: false}}))
		closeModal()
	}

	const placeOnBottom = () => {
		dispatch(customModal({modalResult: {scry: true}}))
		closeModal()
	}

	return (
		<Modal closeModal={doNothing} title="Shelby: Place your top card on bottom of deck?">
			<div className={css.confirmModal}>
				<div className={css.cards}>
					<CardList cards={pile} wrap tooltipAboveModal />
				</div>
				<div className={css.options}>
					<Button variant="primary" size="medium" onClick={placeOnBottom}>
						Place on Bottom
					</Button>
					<Button variant="primary" size="medium" onClick={doNothing}>
						Do Nothing
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ShelbyModal
