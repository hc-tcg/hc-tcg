import {ConfirmModal} from 'components/modal'
import {getPlayerEntity} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'

type Props = {
	closeModal: () => void
}
function ForfeitModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()
	const playerEntity = useSelector(getPlayerEntity)

	const handleYes = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'FORFEIT',
				player: playerEntity,
			},
		})
		closeModal()
	}

	const handleNo = () => {
		closeModal()
	}

	return (
		<ConfirmModal
			setOpen
			title="Forfeit Match"
			description="Are you sure you want to forfeit this game?"
			confirmButtonText="Forfeit"
			onCancel={handleNo}
			onConfirm={handleYes}
		/>
	)
}

export default ForfeitModal
