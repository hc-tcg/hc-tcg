import {useSelector} from 'react-redux'
import Modal from 'components/modal'
import CardList from 'components/card-list'
import {CardT} from 'common/types/game-state'
// import css from './discarded-modal.module.scss'
import css from './game-modals.module.scss'
import {getGameState} from 'logic/game/game-selectors'
import Button from 'components/button'

type Props = {
	closeModal: () => void
}

function DiscardedModal({closeModal}: Props) {
	const discarded: Array<CardT> = useSelector(getGameState)?.discarded || []

	const handleClose = () => {
		closeModal()
	}

	return (
		<Modal title="Discarded" closeModal={handleClose}>
			<div className={css.description}>
				<div className={css.cards}>
					{!discarded.length && <p>No cards have been discarded yet!</p>}
					<CardList cards={discarded} wrap />
				</div>
			</div>
			<div className={css.options}>
				<Button variant="default" size="medium" onClick={handleClose}>
					Close
				</Button>
			</div>
		</Modal>
	)
}

export default DiscardedModal
