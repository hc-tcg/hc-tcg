import {STATUS_EFFECT_CLASSES} from 'common/status-effects'
import {RowState, StatusEffectT} from 'common/types/game-state'
import HealthDisplayModule from 'components/card/health-card-svg'
import StatusEffect from 'components/status-effects/status-effect'
import slotCss from './board.module.scss'
import cardCss from './board.module.scss'
import cn from 'classnames'

type HealthSlotProps = {
	rowState: RowState
	statusEffects: Array<StatusEffectT>
}

const HealthSlot = ({rowState, statusEffects}: HealthSlotProps) => {
	const renderStatusEffects = (cleanedStatusEffects: StatusEffectT[]) => {
		return (
			<div className={slotCss.statusEffectContainer}>
				{cleanedStatusEffects.map((a) => {
					const statusEffect = STATUS_EFFECT_CLASSES[a.statusEffectId]
					if (!statusEffect || !statusEffect.visible) return null
					if (statusEffect.damageEffect == true) return null
					return <StatusEffect statusEffect={statusEffect} duration={a.duration} />
				})}
			</div>
		)
	}
	const renderDamageStatusEffects = (cleanedStatusEffects: StatusEffectT[] | null) => {
		return (
			<div className={slotCss.damageStatusEffectContainer}>
				{cleanedStatusEffects
					? cleanedStatusEffects.map((a) => {
							const statusEffect = STATUS_EFFECT_CLASSES[a.statusEffectId]
							if (!statusEffect || !statusEffect.visible) return null
							if (statusEffect.damageEffect == false) return null
							return <StatusEffect statusEffect={statusEffect} />
						})
					: null}
			</div>
		)
	}

	const hermitStatusEffects = Array.from(
		new Set(
			statusEffects
				.filter((a) => rowState?.hermitCard && a.targetInstance == rowState.hermitCard.cardInstance)
				.map((a) => a) || []
		)
	)

	return (
		<div className={cn(slotCss.cardWrapper, slotCss.health, slotCss.slot, cardCss.card)}>
			{rowState.health && <HealthDisplayModule health={rowState.health} />}
			{renderStatusEffects(hermitStatusEffects)}
			{renderDamageStatusEffects(hermitStatusEffects)}
		</div>
	)
}

export default HealthSlot
