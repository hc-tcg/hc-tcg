import Modal from 'components/modal'
import {useSelector, useDispatch} from 'react-redux'
import {getAvailableActions} from 'logic/game/game-selectors'
import {endTurn} from 'logic/game/game-actions'
import {AvailableActionT} from 'common/types/game-state'
import css from './game-modals.module.scss'
import Button from 'components/button'

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
