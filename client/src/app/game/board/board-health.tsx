import {LocalRowState} from 'common/types/game-state'
import HealthDisplayModule from 'components/card/health-card-svg'
import slotCss from './board.module.scss'
import cardCss from './board.module.scss'
import cn from 'classnames'

type HealthSlotProps = {
	shouldDim: boolean
	rowState: LocalRowState
}

const HealthSlot = ({shouldDim, rowState}: HealthSlotProps) => {
	return (
		<div
			id={slotCss.health}
			className={cn(slotCss.cardWrapper, slotCss.health, slotCss.slot, cardCss.card, {
				[slotCss.unpickable]: shouldDim,
			})}
		>
			{rowState.health && <HealthDisplayModule health={rowState.health} />}
		</div>
	)
}

export default HealthSlot
