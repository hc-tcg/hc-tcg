import Modal from 'components/modal'
import {useSelector, useDispatch} from 'react-redux'
import {getAvailableActions} from 'logic/game/game-selectors'
import {endTurn} from 'logic/game/game-actions'
import {AvailableActionT} from 'common/types/game-state'
import css from './end-turn-modal.module.css'

const ActionMap: Record<AvailableActionT, string | null> = {
	PLAY_ITEM_CARD: 'Playing an item card',
	PLAY_SINGLE_USE_CARD: 'Playing a single use effect card',
	PLAY_EFFECT_CARD: 'Attaching an effect card',
	ADD_HERMIT: 'Playing a hermit card',
	CHANGE_ACTIVE_HERMIT: 'Changing your active hermit',
	ZERO_ATTACK: 'Attacking opponent with an effect',
	PRIMARY_ATTACK: 'Attacking opponent with a primary attack',
	SECONDARY_ATTACK: 'Attacking opponent with a secondary attack',
	WAIT_FOR_OPPONENT_FOLLOWUP: null,
	FOLLOW_UP: null,
	APPLY_EFFECT: null,
	REMOVE_EFFECT: null,
	END_TURN: null,
	WAIT_FOR_TURN: null,
}

type Props = {
	closeModal: () => void
}
function EndTurnModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const availableActions = useSelector(getAvailableActions)

	const handleEndTurn = () => {
		dispatch(endTurn())
		closeModal()
	}

	const handleCancel = () => {
		closeModal()
	}

	return (
		<Modal title="End Turn">
			<div className={css.confirmModal}>
				<div className={css.description}>
					Are you sure you want to end your turn? These actions are still
					available:
				</div>
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
				<div className={css.options}>
					<button onClick={handleEndTurn}>End Turn</button>
					<button onClick={handleCancel}>Cancel</button>
				</div>
			</div>
		</Modal>
	)
}

export default EndTurnModal
