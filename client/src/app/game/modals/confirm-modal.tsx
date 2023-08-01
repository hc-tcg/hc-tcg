import Modal from 'components/modal'
import {useDispatch, useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import {applyEffect, removeEffect} from 'logic/game/game-actions'
import {getPlayerState} from 'logic/game/game-selectors'
import Button from 'components/button'
import {CARDS} from 'common/cards'

type Props = {
	closeModal: () => void
}
function ConfirmModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handleYes = () => {
		dispatch(applyEffect({}))
		closeModal()
	}

	const handleNo = () => {
		dispatch(removeEffect())
		closeModal()
	}

	const getCardName = () => {
		const playerState = useSelector(getPlayerState)

		if (!playerState) return null
		const singleUseCard = playerState.board.singleUseCard

		if (!singleUseCard) return null
		const cardId = singleUseCard.cardId
		const cardName = CARDS[cardId].name

		return cardName
	}

	return (
		<Modal title="Play Single Use Card" closeModal={closeModal}>
			<div className={css.confirmModal}>
				<div className={css.description}>
					Are you sure you want to use the {getCardName()}?
					{/* Would you like to apply the {getCardName()}? */}
				</div>
				<div className={css.options}>
					<Button size="medium" onClick={handleYes}>
						Yes
					</Button>
					<Button size="medium" onClick={handleNo}>
						No
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ConfirmModal
