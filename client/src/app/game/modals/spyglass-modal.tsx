import Modal from 'components/modal'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
import CardList from 'components/card-list'
import {CardT} from 'types/game-state'
import css from './spyglass-modal.module.css'

type Props = {
	closeModal: () => void
}
function SpyglassModal({closeModal}: Props) {
	const spyglass: Array<CardT> = useSelector((state: RootState) => {
		const playerId = state.playerId
		if (!playerId) return []
		return state.gameState?.players[playerId]?.custom.spyglass || []
	})

	return (
		<Modal title="Spyglass" closeModal={closeModal}>
			<div className={css.wrapper}>
				<div className={css.cards}>
					<CardList size="small" cards={spyglass} />
				</div>
				<div className={css.options}>
					<button onClick={closeModal}>Hmmmmm</button>
				</div>
			</div>
		</Modal>
	)
}

export default SpyglassModal
