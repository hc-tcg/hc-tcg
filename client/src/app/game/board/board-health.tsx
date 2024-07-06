import {RowState, StatusEffectT} from 'common/types/game-state'
import HealthDisplayModule from 'components/card/health-card-svg'
import slotCss from './board.module.scss'
import cardCss from './board.module.scss'
import cn from 'classnames'
import StatusEffectContainer from './board-status-effects'

type HealthSlotProps = {
	rowState: RowState
	statusEffects: Array<StatusEffectT>
}

const HealthSlot = ({rowState, statusEffects}: HealthSlotProps) => {
	return (
		<div
			id={slotCss.health}
			className={cn(slotCss.cardWrapper, slotCss.health, slotCss.slot, cardCss.card)}
		>
			{rowState.health && <HealthDisplayModule health={rowState.health} />}
			<StatusEffectContainer statusEffects={statusEffects} />
		</div>
	)
}

export default HealthSlot
