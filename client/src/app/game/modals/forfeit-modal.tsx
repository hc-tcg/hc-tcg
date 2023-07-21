import Modal from 'components/modal'
import {useDispatch} from 'react-redux'
import css from './game-modals.module.scss'
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
		<Modal title="Forfeit Match" closeModal={handleNo}>
			<div className={css.confirmModal}>
				<div className={css.description}>Are you sure you want to forfeit this game?</div>
				<div className={css.options}>
					<Button variant="error" onClick={handleYes}>
						Forfeit
					</Button>
					<Button onClick={handleNo}>Cancel</Button>
				</div>
			</div>
		</Modal>
	)
}

export default AttackModal
