import {StatusEffectComponent} from 'common/types/game-state'
import css from './board.module.scss'
import StatusEffect from 'components/status-effects/status-effect'
import {LocalStatusEffectInstance} from 'common/types/server-requests'

type StatusEffectDisplayProps = {
	statusEffects: Array<LocalStatusEffectInstance>
}

const StatusEffectContainer = ({statusEffects}: StatusEffectDisplayProps) => {
	return (
		<div>
			<div className={css.statusEffectContainer}>
				{statusEffects.map((effect) => {
					if (effect.props.damageEffect || effect.props.hidden) return
					return (
						<StatusEffect
							key={effect.instance}
							statusEffect={effect.props}
							counter={effect.counter}
						/>
					)
				})}
			</div>
			<div className={css.damageStatusEffectContainer}>
				{statusEffects.map((effect) => {
					if (!effect.props.damageEffect || effect.props.hidden) return
					return (
						<StatusEffect
							key={effect.instance}
							statusEffect={effect.props}
							counter={effect.counter}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default StatusEffectContainer
