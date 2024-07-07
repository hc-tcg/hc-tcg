import {LocalRowState, StatusEffectInstance} from 'common/types/game-state'
import HealthDisplayModule from 'components/card/health-card-svg'
import slotCss from './board.module.scss'
import cardCss from './board.module.scss'
import cn from 'classnames'
import StatusEffectContainer from './board-status-effects'
import {getSelectedCard} from 'logic/game/game-selectors'
import {useSelector} from 'react-redux'

type HealthSlotProps = {
	rowState: LocalRowState
	statusEffects: Array<StatusEffectInstance>
}

const HealthSlot = ({rowState, statusEffects}: HealthSlotProps) => {
	const selectedCard = useSelector(getSelectedCard)
	return (
		<div
			className={cn(slotCss.cardWrapper, slotCss.health, slotCss.slot, cardCss.card, {
				[slotCss.unpickable]: selectedCard !== null,
			})}
		>
			{rowState.health && <HealthDisplayModule health={rowState.health} />}
			<StatusEffectContainer statusEffects={statusEffects} />
		</div>
	)
}

export default HealthSlot
