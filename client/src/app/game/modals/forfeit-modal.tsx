import Modal from 'components/modal'
import {useDispatch} from 'react-redux'
import css from './forfeit-modal.module.css'
import {forfeit} from 'logic/game/game-actions'
import Button from 'components/button/button'

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handleYes = () => {
		dispatch(forfeit())
		closeModal()
	}

	const handleNo = () => {
		closeModal()
	}

	return (
		<Modal title="!! Forfeit !!">
			<div className={css.confirmModal}>
				<div className={css.description}>
					Do you really wish to forfeit this game?
				</div>
				<div className={css.options}>
					<Button variant="stone" onClick={handleYes}>
						Yes
					</Button>
					<Button variant="stone" onClick={handleNo}>
						No
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default AttackModal
