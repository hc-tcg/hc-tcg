import Modal from 'components/modal'
import {useDispatch} from 'react-redux'

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const primaryAttack = () => {
		dispatch({type: 'ATTACK', payload: {type: 'primary'}})
		closeModal()
	}

	const secondaryAttack = () => {
		dispatch({type: 'ATTACK', payload: {type: 'secondary'}})
		closeModal()
	}
	return (
		<Modal title="Attack" closeModal={closeModal}>
			<div>
				<button onClick={primaryAttack}>Primary attack</button>
				<button onClick={secondaryAttack}>Secondary attack</button>
			</div>
		</Modal>
	)
}

export default AttackModal
