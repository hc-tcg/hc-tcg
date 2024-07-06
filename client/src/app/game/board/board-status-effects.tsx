import {StatusEffectT} from 'common/types/game-state'
import css from './board.module.scss'
import {STATUS_EFFECT_CLASSES} from 'common/status-effects'
import StatusEffect from 'components/status-effects/status-effect'

type StatusEffectDisplayProps = {
	statusEffects: Array<StatusEffectT>
}

const StatusEffectContainer = ({statusEffects}: StatusEffectDisplayProps) => {
	return (
		<div>
			<div className={css.statusEffectContainer}>
				{statusEffects.map((a) => {
					const statusEffect = STATUS_EFFECT_CLASSES[a.statusEffectId]
					if (!statusEffect || !statusEffect.visible) return null
					if (statusEffect.damageEffect == true) return null
					return <StatusEffect statusEffect={statusEffect} duration={a.duration} />
				})}
			</div>
			<div className={css.damageStatusEffectContainer}>
				{statusEffects.map((a) => {
					const statusEffect = STATUS_EFFECT_CLASSES[a.statusEffectId]
					if (!statusEffect || !statusEffect.visible) return null
					if (statusEffect.damageEffect == false) return null
					return <StatusEffect statusEffect={statusEffect} duration={a.duration} />
				})}
			</div>
		</div>
	)
}

export default StatusEffectContainer
