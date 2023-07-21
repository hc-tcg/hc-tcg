import Modal from 'components/modal'
import css from './game-modals.module.scss'
import Button from 'components/button'

type Props = {
	closeModal: () => void
}
function UnmetCondition({closeModal}: Props) {
	const handleOk = () => {
		closeModal()
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
