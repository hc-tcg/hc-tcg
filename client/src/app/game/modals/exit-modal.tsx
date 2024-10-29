import Button from 'components/button/button'
import Modal from 'components/modal'
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
		<Modal title="Exit Game" closeModal={handleNo}>
			<Modal.Description>
				Are you sure you want to stop spectating this game?
			</Modal.Description>
			<Modal.Options>
				<Button onClick={handleNo}>Cancel</Button>
				<Button variant="error" onClick={handleYes}>
					Exit
				</Button>
			</Modal.Options>
		</Modal>
	)
}

export default ExitModal
