import Button from 'components/button/button'
import Modal from 'components/modal'
import {getPlayerEntity} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()
	const player = useSelector(getPlayerEntity)

	const handleYes = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'FORFEIT',
				player,
			},
		})
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
