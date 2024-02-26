import StatusEffect from 'common/status-effects/status-effect'
import css from './status-effect-tooltip.module.scss'

type Props = {
	statusEffect: StatusEffect
	duration?: number | undefined
}

const StatusEffectTooltip = ({ statusEffect, duration }: Props) => {
	return (
		<div className={css.statusEffectTooltip}>
			<div className={css.topLine}>
				<div className={css.name}>{statusEffect.name}</div>
			</div>
			<div className={css.description}>{statusEffect.description}</div>
			{duration !== undefined && statusEffect.counter && (
				<div className={css.turnsRemaining}>
					Number: <span className={css.duration}>{duration}</span>
				</div>
			)}
			{duration !== undefined && !statusEffect.counter && (
				<div className={css.turnsRemaining}>
					Turns remaining: <span className={css.duration}>{duration}</span>
				</div>
			)}
		</div>
	)
}

export default StatusEffectTooltip
