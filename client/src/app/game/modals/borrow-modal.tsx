import Modal from 'components/modal'
import {useDispatch} from 'react-redux'
import css from './confirm-modal.module.css'
import Button from 'components/button'

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
					<Button variant="stone" onClick={handleAttach}>
						Attach
					</Button>
					<Button variant="stone" onClick={handleDiscard}>
						Discard
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default BorrowModal
