import Modal from 'components/modal'
import css from './confirm-modal.module.css'

import Button from 'components/button'

type Props = {
	closeModal: () => void
}
function UnmetCondition({closeModal}: Props) {
	const handleOk = () => {
		closeModal()
	}

	return (
		<Modal title="Unmet Condition">
			<div className={css.confirmModal}>
				<div className={css.description}>
					You can't play this card at the moment.
				</div>
				<div className={css.options}>
					<Button variant="primary" size="small" onClick={handleOk}>
						Ok
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default UnmetCondition
