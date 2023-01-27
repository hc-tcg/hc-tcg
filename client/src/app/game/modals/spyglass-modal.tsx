import Modal from 'components/modal'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
import CARDS from 'server/cards'
import Card from 'components/card'
import {CardT} from 'types/game-state'
import {CardInfoT} from 'types/cards'
import css from './spyglass-modal.module.css'

type Props = {
	closeModal: () => void
}
function SpyglassModal({closeModal}: Props) {
	// TODO - This whole file needs to be rafactored
	const spyglass = useSelector((state: RootState) => {
		const playerId = state.playerId
		if (!playerId) return null
		return state.gameState?.players[playerId]?.custom.spyglass || null
	})

	const spyglassInfo = spyglass
		.map((card: CardT) => {
			return CARDS[card.cardId] || null
		})
		.filter(Boolean)

	return (
		<Modal title="Spyglass" closeModal={closeModal}>
			<div className={css.confirmModal}>
				<div className={css.cards}>
					{spyglassInfo.map((info: CardInfoT) => {
						return (
							<div className={css.card}>
								<Card card={info} />
							</div>
						)
					})}
				</div>
				<div className={css.options}>
					<button onClick={closeModal}>Hmmmmm</button>
				</div>
			</div>
		</Modal>
	)
}

export default SpyglassModal
