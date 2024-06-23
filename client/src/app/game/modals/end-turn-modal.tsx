import Modal from 'components/modal'
import {useSelector, useDispatch} from 'react-redux'
import {getAvailableActions} from 'logic/game/game-selectors'
import {endTurn} from 'logic/game/game-actions'
import {TurnAction} from 'common/types/game-state'
import css from './game-modals.module.scss'
import Button from 'components/button'

const ActionMap: Record<TurnAction, string | null> = {
	PLAY_ITEM_CARD: 'Playing an item card',
	PLAY_SINGLE_USE_CARD: 'Playing a single use effect card',
	PLAY_EFFECT_CARD: 'Playing an attach effect card',
	PLAY_HERMIT_CARD: 'Playing a hermit card',
	CHANGE_ACTIVE_HERMIT: 'Changing your active hermit',
	SINGLE_USE_ATTACK: 'Attacking opponent with a single use effect',
	PRIMARY_ATTACK: 'Attacking opponent with a primary attack',
	SECONDARY_ATTACK: 'Attacking opponent with a secondary attack',
	WAIT_FOR_OPPONENT_ACTION: null,
	PICK_REQUEST: null,
	APPLY_EFFECT: null,
	REMOVE_EFFECT: null,
	END_TURN: null,
	WAIT_FOR_TURN: null,
	MODAL_REQUEST: null,
}

type Props = {
	closeModal: () => void
}
function EndTurnModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const availableActions = useSelector(getAvailableActions)

	if (availableActions.includes('WAIT_FOR_TURN')) return null

	const handleEndTurn = () => {
		dispatch(endTurn())
		closeModal()
	}

	const handleCancel = () => {
		closeModal()
	}

	return (
		<Modal title="End Turn" closeModal={handleCancel}>
			<div className={css.description}>
				<p>Are you sure you want to end your turn? These actions are still available:</p>
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
