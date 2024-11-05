import {ConfirmModal} from 'components/modal'
import {localMessages, useMessageDispatch} from 'logic/messages'

type Props = {
	closeModal: () => void
}
function ForfeitModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()

	const handleYes = () => {
		dispatch({type: localMessages.GAME_FORFEIT})
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
