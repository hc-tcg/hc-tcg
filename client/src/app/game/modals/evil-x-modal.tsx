import Modal from 'components/modal'
import {useDispatch} from 'react-redux'
import css from './game-modals.module.scss'
import Button from 'components/button'
import {modalRequest} from 'logic/game/game-actions'

type Props = {
	closeModal: () => void
}
function EvilXModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handlePrimary = () => {
		dispatch(modalRequest({modalResult: {disable: 'primary'}}))
		closeModal()
	}

	const handleSecondary = () => {
		dispatch(modalRequest({modalResult: {disable: 'secondary'}}))
		closeModal()
	}

	return (
		<Modal closeModal={handleSecondary} title="Evil X: Disable an attack for 1 turn">
			<div className={css.confirmModal}>
				<div className={css.description}>
					Which of the opponent's attacks do you want to disable?
				</div>
				<div className={css.options}>
					<Button variant="primary" size="medium" onClick={handlePrimary}>
						Primary
					</Button>
					<Button variant="primary" size="medium" onClick={handleSecondary}>
						Secondary
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default EvilXModal
