import {TurnAction} from 'common/types/game-state'
import Button from 'components/button'
import Modal from 'components/modal'
import {getAvailableActions} from 'logic/game/game-selectors'
import {ActionMap} from 'logic/game/tasks/action-modals-saga'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
}

function EndTurnModal({closeModal}: Props) {
	const availableActions = useSelector(getAvailableActions)
	const dispatch = useMessageDispatch()
	const settings = useSelector(getSettings)

	const handleEndTurn = () => {
		dispatch({type: localMessages.GAME_TURN_END})
		closeModal()
	}

	const handleCancel = () => {
		closeModal()
	}

	if (!settings.confirmationDialogsEnabled) {
		handleEndTurn()
		return null
	}

	let modal = EndTurnModalBody({availableActions, handleCancel, handleEndTurn})

	if (modal !== null) {
		return modal
	}

	handleEndTurn()
}

export function EndTurnModalBody({
	availableActions,
	handleCancel,
	handleEndTurn,
}: {
	availableActions: Array<TurnAction>
	handleCancel?: () => void
	handleEndTurn?: () => void
}) {
	if (availableActions.includes('WAIT_FOR_TURN')) return null

	if (availableActions.every((action) => ActionMap[action] === null)) {
		return null
	}

	return (
		<Modal title="End Turn" closeModal={handleCancel || (() => {})}>
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
