import {LocalRowState} from 'common/types/game-state'
import HealthDisplayModule from 'components/card/health-card-svg'
import slotCss from './board.module.scss'
import cardCss from './board.module.scss'
import cn from 'classnames'
import StatusEffectContainer from './board-status-effects'
import {useSelector} from 'react-redux'
import {getGameState, getSelectedCard} from 'logic/game/game-selectors'
import {LocalStatusEffectInstance} from 'common/types/server-requests'

type HealthSlotProps = {
	rowState: LocalRowState
	statusEffects: Array<LocalStatusEffectInstance>
}

const HealthSlot = ({rowState, statusEffects}: HealthSlotProps) => {
	const localGameState = useSelector(getGameState)
	const selectedCard = useSelector(getSelectedCard)

	return (
		<div
			id={slotCss.health}
			className={cn(slotCss.cardWrapper, slotCss.health, slotCss.slot, cardCss.card, {
				[slotCss.unpickable]:
					(selectedCard || localGameState?.currentPickableSlots) &&
					localGameState?.turn.currentPlayerId === localGameState?.playerId,
			})}
		>
			{rowState.health && <HealthDisplayModule health={rowState.health} />}
			<StatusEffectContainer statusEffects={statusEffects} />
		</div>
	)
}

export default HealthSlot
