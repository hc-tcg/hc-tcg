import Button from 'components/button'
import Modal from 'components/modal'
import {localMessages, useActionDispatch} from 'logic/messages'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
	info: {removeSuAfter: boolean}
}
function UnmetCondition({closeModal, info}: Props) {
	const dispatch = useActionDispatch()
	const handleOk = () => {
		closeModal()
		if (info?.removeSuAfter) {
			dispatch({type: localMessages.GAME_EFFECT_REMOVE})
		}
	}

	return (
		<Modal title="Unmet Condition" closeModal={closeModal}>
			<div className={css.confirmModal}>
				<div className={css.description}>
					You can't play this card in that slot at the moment.
				</div>
				<div className={css.options}>
					<Button onClick={handleOk}>Okay</Button>
				</div>
			</div>
		</Modal>
	)
}

export default UnmetCondition
