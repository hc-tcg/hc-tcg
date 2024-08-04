import Button from 'components/button/button'
import Modal from 'components/modal'
import {exitSpectating} from 'logic/game/game-actions'
import {useDispatch} from 'react-redux'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
}
function ExitModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const handleYes = () => {
		dispatch(exitSpectating())
		closeModal()
	}

	const handleNo = () => {
		closeModal()
	}

	return (
		<Modal title="Exit Game" closeModal={handleNo}>
			<div className={css.confirmModal}>
				<div className={css.description}>
					Are you sure you want to stop spectating this game?
				</div>
				<div className={css.options}>
					<Button onClick={handleNo}>Cancel</Button>
					<Button variant="error" onClick={handleYes}>
						Exit
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ExitModal
