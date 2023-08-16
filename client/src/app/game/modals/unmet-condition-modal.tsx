import Modal from 'components/modal'
import css from './game-modals.module.scss'
import Button from 'components/button'
import {useDispatch} from 'react-redux'
import {removeEffect} from 'logic/game/game-actions'

type Props = {
	closeModal: () => void
	info: {removeSuAfter: boolean}
}
function UnmetCondition({closeModal, info}: Props) {
	const dispatch = useDispatch()
	const handleOk = () => {
		closeModal()
		if (info?.removeSuAfter) {
			dispatch(removeEffect())
		}
	}

	return (
		<Modal title="Unmet Condition" closeModal={closeModal}>
			<div className={css.confirmModal}>
				<div className={css.description}>You can't play this card at the moment.</div>
				<div className={css.options}>
					<Button onClick={handleOk}>Okay</Button>
				</div>
			</div>
		</Modal>
	)
}

export default UnmetCondition
