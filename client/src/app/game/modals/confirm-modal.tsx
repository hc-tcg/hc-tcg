import Button from 'components/button'
import Modal from 'components/modal'
import {localMessages, useActionDispatch} from 'logic/messages'
import {getPlayerState} from 'logic/game/game-selectors'
import {useSelector} from 'react-redux'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
}
function ConfirmModal({closeModal}: Props) {
	const dispatch = useActionDispatch()

	const handleYes = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'APPLY_EFFECT',
			},
		})
		closeModal()
	}

	const handleNo = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'REMOVE_EFFECT',
			},
		})
		closeModal()
	}

	const getCardName = () => {
		const playerState = useSelector(getPlayerState)

		if (!playerState) return null
		const singleUseCard = playerState.board.singleUse.card

		if (!singleUseCard) return null
		return singleUseCard.props.name
	}

	return (
		<Modal title="Play Single Use Card" closeModal={handleNo}>
			<div className={css.confirmModal}>
				<div className={css.description}>
					Are you sure you want to use {getCardName()}?
				</div>
				<div className={css.options}>
					<Button size="medium" onClick={handleNo}>
						No
					</Button>
					<Button size="medium" onClick={handleYes}>
						Yes
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ConfirmModal
