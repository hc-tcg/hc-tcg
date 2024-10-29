import {ConfirmModal} from 'components/modal/modal'
import {localMessages, useMessageDispatch} from 'logic/messages'

type Props = {
	closeModal: () => void
}
function ExitModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()

	const handleYes = () => {
		dispatch({type: localMessages.GAME_SPECTATOR_LEAVE})
		closeModal()
	}

	const handleNo = () => {
		closeModal()
	}

	return (
		<ConfirmModal
			setOpen
			title="Exit Game"
			description="Are you sure you want to stop spectating this game?"
			confirmButtonText="Exit"
			onCancel={handleNo}
			onConfirm={handleYes}
		/>
	)
}

export default ExitModal
