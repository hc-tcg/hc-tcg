import {LocalRowState} from 'common/types/game-state'
import HealthDisplayModule from 'components/card/health-card-svg'
import slotCss from './board.module.scss'
import cardCss from './board.module.scss'
import cn from 'classnames'
import {useSelector} from 'react-redux'
import {getGameState, getSelectedCard} from 'logic/game/game-selectors'

type HealthSlotProps = {
	rowState: LocalRowState
}

const HealthSlot = ({rowState}: HealthSlotProps) => {
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
			{rowState.health && (
				<HealthDisplayModule health={rowState.hermit.card?.turnedOver ? null : rowState.health} />
			)}
		</div>
	)
}

export default HealthSlot
