import Modal from 'components/modal'
import {useDispatch} from 'react-redux'
import css from './evil-x-modal.module.css'
import Button from 'components/button'
import {followUp} from 'logic/game/game-actions'

type Props = {
	closeModal: () => void
}
function EvilXModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handlePrimary = () => {
		dispatch(followUp({modalResult: {disable: 'primary'}}))
		closeModal()
	}

	const handleSecondary = () => {
		dispatch(followUp({modalResult: {disable: 'secondary'}}))
		closeModal()
	}

	return (
		<Modal title="Evil X: Disable an attack for 1 turn">
			<div className={css.confirmModal}>
				<div className={css.description}>
					Which of the opponent's attacks do you want to disable?
				</div>
				<div className={css.options}>
					<Button variant="primary" size="small" onClick={handlePrimary}>
						Primary
					</Button>
					<Button variant="primary" size="small" onClick={handleSecondary}>
						Secondary
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default EvilXModal
