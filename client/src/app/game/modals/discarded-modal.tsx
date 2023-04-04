import {useSelector} from 'react-redux'
import Modal from 'components/modal'
import CardList from 'components/card-list'
import {CardT} from 'common/types/game-state'
import css from './discarded-modal.module.scss'
import {getGameState} from 'logic/game/game-selectors'

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
			<div className={css.wrapper}>
				<div className={css.cards}>
					<CardList size="small" cards={discarded} />
				</div>
				<div className={css.options}>
					<button onClick={handleClose}>Close</button>
				</div>
			</div>
		</Modal>
	)
}

export default DiscardedModal
