import Button from 'components/button'
import Modal from 'components/modal'
import {getAvailableActions} from 'logic/game/game-selectors'
import {useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import {ActionMap} from 'logic/game/tasks/action-modals-saga'
import {actions, useActionDispatch} from 'logic/messages'

type Props = {
	closeModal: () => void
}

function EndTurnModal({closeModal}: Props) {
	const availableActions = useSelector(getAvailableActions)
	const dispatch = useActionDispatch()

	if (availableActions.includes('WAIT_FOR_TURN')) return null

	const handleEndTurn = () => {
		dispatch({type: actions.GAME_TURN_END})
		closeModal()
	}

	const handleCancel = () => {
		closeModal()
	}

	return (
		<Modal title="End Turn" closeModal={handleCancel}>
			<div className={css.description}>
				<p>
					Are you sure you want to end your turn? These actions are still
					available:
				</p>
				<hr />
				<ul className={css.availableActions}>
					{availableActions.map((action) => {
						const text = ActionMap[action]
						if (!text) return null
						return (
							<li key={action} className={css.action}>
								{text}
							</li>
						)
					})}
				</ul>
			</div>
			<div className={css.options}>
				<Button variant="default" size="medium" onClick={handleCancel}>
					Cancel
				</Button>
				<Button variant="error" size="medium" onClick={handleEndTurn}>
					End Turn
				</Button>
			</div>
		</Modal>
	)
}

export default EndTurnModal
