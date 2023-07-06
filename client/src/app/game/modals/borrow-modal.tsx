import Modal from 'components/modal'
import {useDispatch, useSelector} from 'react-redux'
// import css from './confirm-modal.module.css'
import css from './game-modals.module.scss'
import Button from 'components/button'
import {getPlayerState} from 'logic/game/game-selectors'
import CARDS from 'server/cards'

type Props = {
	closeModal: () => void
}
function BorrowModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handleAttach = () => {
		dispatch({type: 'BORROW_ATTACH'})
		closeModal()
	}

	const handleDiscard = () => {
		dispatch({type: 'BORROW_DISCARD'})
		closeModal()
	}

	const getBorrowedCard = () => {
		const playerState = useSelector(getPlayerState)
		if (!playerState) return null

		const custom = Object.values(playerState.custom)
		if (!custom.length) return null

		const borrowedId = custom[0].cardId
		const borrowedName = CARDS[borrowedId].name

		return borrowedName
	}

	return (
		<Modal title="Borrow" closeModal={handleDiscard}>
			<div className={css.description}>
				Would you like to attach or discard your opponents' {getBorrowedCard()}{' '}
				card?
			</div>
			<div className={css.options}>
				<Button onClick={handleAttach}>Attach</Button>
				<Button onClick={handleDiscard}>Discard</Button>
			</div>
		</Modal>
	)
}

export default BorrowModal
