import Button from "components/button"
import Modal from "components/modal"
import {removeEffect} from "logic/game/game-actions"
import {useDispatch} from "react-redux"
import css from "./game-modals.module.scss"

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
