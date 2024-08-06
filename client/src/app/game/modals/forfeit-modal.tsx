import Button from 'components/button/button'
import Modal from 'components/modal'
import {actions} from 'logic/actions'
import {useDispatch} from 'react-redux'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handleYes = () => {
		dispatch({type: actions.GAME_FORFEIT})
		closeModal()
	}

	const handleNo = () => {
		closeModal()
	}

	return (
		<Modal title="Forfeit Match" closeModal={handleNo}>
			<div className={css.confirmModal}>
				<div className={css.description}>
					Are you sure you want to forfeit this game?
				</div>
				<div className={css.options}>
					<Button onClick={handleNo}>Cancel</Button>
					<Button variant="error" onClick={handleYes}>
						Forfeit
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default AttackModal
