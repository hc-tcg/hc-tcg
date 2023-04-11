import Modal from 'components/modal'
import {useDispatch} from 'react-redux'
import css from './confirm-modal.module.css'

import {removeEffect} from 'logic/game/game-actions'
import Button from 'components/button'

type Props = {
	closeModal: () => void
}
function UnmetCondition({closeModal}: Props) {
	const dispatch = useDispatch()

	const handleOk = () => {
		dispatch(removeEffect())
		closeModal()
	}

	return (
		<Modal title="Unmet Condition">
			<div className={css.confirmModal}>
				<div className={css.description}>
					You can't use this effect at the moment.
				</div>
				<div className={css.options}>
					<Button variant="stone" onClick={handleOk}>
						Ok
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default UnmetCondition
