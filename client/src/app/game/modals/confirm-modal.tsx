import Modal from 'components/modal'
import {useDispatch} from 'react-redux'
import css from './confirm-modal.module.css'

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handleYes = () => {
		dispatch({type: 'APPLY_EFFECT'})
		closeModal()
	}

	const handleNo = () => {
		// TODO - implement removing SU cards on server
		// dispatch({type: 'REMOVE_EFFECT'})
		closeModal()
	}

	return (
		<Modal title="Confirm" closeModal={closeModal}>
			<div className={css.confirmModal}>
				<div className={css.description}>
					Do you want to apply selected single use effect?
				</div>
				<div className={css.options}>
					<button onClick={handleYes}>Yes</button>
					<button onClick={handleNo}>No</button>
				</div>
			</div>
		</Modal>
	)
}

export default AttackModal
