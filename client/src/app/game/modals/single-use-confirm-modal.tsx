import {CARDS} from 'common/cards'
import {ConfirmModal} from 'components/modal'
import {getPlayerState} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'

type Props = {
	closeModal: () => void
}
function SingleUseConfirmModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()

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
		return CARDS[singleUseCard.id].name
	}

	return (
		<ConfirmModal
			setOpen
			title="Play Single Use Card"
			description={`Are you sure you want to use ${getCardName()}?`}
			cancelButtonText="No"
			confirmButtonText="Yes"
			confirmButtonVariant="default"
			onCancel={handleNo}
			onConfirm={handleYes}
		/>
	)
}

export default SingleUseConfirmModal
