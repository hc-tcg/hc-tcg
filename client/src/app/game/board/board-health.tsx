import {LocalRowState} from 'common/types/game-state'
import HealthDisplayModule from 'components/card/health-card-svg'
import slotCss from './board.module.scss'
import cardCss from './board.module.scss'
import cn from 'classnames'
import {LocalStatusEffectInstance} from 'common/types/server-requests'
import StatusEffect from 'components/status-effects/status-effect'

type HealthSlotProps = {
	shouldDim: boolean
	rowState: LocalRowState
	damageStatusEffect: LocalStatusEffectInstance | undefined
}

const HealthSlot = ({shouldDim, rowState, damageStatusEffect}: HealthSlotProps) => {
	return (
		<div
			id={slotCss.health}
			className={cn(slotCss.cardWrapper, slotCss.health, slotCss.slot, cardCss.card, {
				[slotCss.unpickable]: shouldDim,
			})}
		>
			{rowState.health && (
				<HealthDisplayModule health={rowState.hermit.card?.turnedOver ? null : rowState.health} />
			)}
			{damageStatusEffect && (
				<div className={slotCss.damageStatusEffectContainer}>
					<StatusEffect
						key={damageStatusEffect.instance}
						statusEffect={damageStatusEffect}
						counter={damageStatusEffect.counter}
					/>
				</div>
			)}
		</div>
	)
}

export default HealthSlot
