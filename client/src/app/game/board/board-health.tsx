import cn from 'classnames'
import {LocalRowState} from 'common/types/game-state'
import {LocalStatusEffectInstance} from 'common/types/server-requests'
import HealthDisplayModule from 'components/card/health-card-svg'
import StatusEffect from 'components/status-effects/status-effect'
import slotCss from './board.module.scss'
import cardCss from './board.module.scss'

type HealthSlotProps = {
	shouldDim: boolean
	rowState: LocalRowState
	damageStatusEffect: LocalStatusEffectInstance | undefined
}

const HealthSlot = ({
	shouldDim,
	rowState,
	damageStatusEffect,
}: HealthSlotProps) => {
	return (
		<div
			id={slotCss.health}
			className={cn(
				slotCss.cardWrapper,
				slotCss.health,
				slotCss.slot,
				cardCss.card,
				{
					[slotCss.unpickable]: shouldDim,
				},
			)}
		>
			{rowState.health && (
				<HealthDisplayModule
					health={rowState.hermit.card?.turnedOver ? null : rowState.health}
				/>
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
