import Modal from 'components/modal'
import {useDispatch} from 'react-redux'
import css from './confirm-modal.module.css'

type Props = {
	closeModal: () => void
}
function BorrowModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handleAttach = () => {
		dispatch({type: 'BORROW_ATTACH'})
		closeModal()
	}

	const handleDiscard = () => {
		dispatch({type: 'BORROW_DISCARD'})
		closeModal()
	}

	return (
		<Modal title="Borrow">
			<div className={css.confirmModal}>
				<div className={css.description}>
					Do you wish to attach the "borrowed" card or discard it?
				</div>
				<div className={css.options}>
					<button onClick={handleAttach}>Attach</button>
					<button onClick={handleDiscard}>Discard</button>
				</div>
			</div>
		</Modal>
	)
}

export default BorrowModal
