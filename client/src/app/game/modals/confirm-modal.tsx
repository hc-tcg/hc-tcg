import Modal from 'components/modal'
import {useDispatch} from 'react-redux'
import css from './confirm-modal.module.css'

import {applyEffect, removeEffect} from 'logic/game/game-actions'

type Props = {
	closeModal: () => void
}
function ConfirmModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handleYes = () => {
		dispatch(applyEffect({}))
		closeModal()
	}

	const handleNo = () => {
		dispatch(removeEffect())
		closeModal()
	}

	return (
		<Modal title="Confirm">
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

export default ConfirmModal
