import {StatusEffectInstance} from 'common/types/game-state'
import css from './board.module.scss'
import StatusEffect from 'components/status-effects/status-effect'

type StatusEffectDisplayProps = {
	statusEffects: Array<StatusEffectInstance>
}

const StatusEffectContainer = ({statusEffects}: StatusEffectDisplayProps) => {
	return (
		<div>
			<div className={css.statusEffectContainer}>
				{statusEffects.map((effect) => {
					if (effect.statusEffect.props.damageEffect) return
					return (
						<StatusEffect
							key={effect.instance}
							statusEffect={effect.statusEffect.props}
							counter={effect.counter}
						/>
					)
				})}
			</div>
			<div className={css.damageStatusEffectContainer}>
				{statusEffects.map((effect) => {
					if (!effect.statusEffect.props.damageEffect) return
					return (
						<StatusEffect
							key={effect.instance}
							statusEffect={effect.statusEffect.props}
							counter={effect.counter}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default StatusEffectContainer
