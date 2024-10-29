import Button from 'components/button/button'
import Modal from 'components/modal'
import {localMessages, useMessageDispatch} from 'logic/messages'

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()

	const handleYes = () => {
		dispatch({type: localMessages.GAME_FORFEIT})
		closeModal()
	}

	const handleNo = () => {
		closeModal()
	}

	return (
		<Modal title="Forfeit Match" closeModal={handleNo}>
			<Modal.Description>
				Are you sure you want to forfeit this game?
			</Modal.Description>
			<Modal.Options>
				<Button onClick={handleNo}>Cancel</Button>
				<Button variant="error" onClick={handleYes}>
					Forfeit
				</Button>
			</Modal.Options>
		</Modal>
	)
}

export default AttackModal
