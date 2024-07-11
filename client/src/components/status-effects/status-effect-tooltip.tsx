import {StatusEffectProps, isCounter} from 'common/status-effects/status-effect'
import css from './status-effect-tooltip.module.scss'

type Props = {
	statusEffect: StatusEffectProps
	counter: number | null
}

const StatusEffectTooltip = ({statusEffect, counter}: Props) => {
	return (
		<div className={css.statusEffectTooltip}>
			<div className={css.topLine}>
				<div className={css.name}>{statusEffect.name}</div>
			</div>
			<div className={css.description}>{statusEffect.description}</div>
			{isCounter(statusEffect) && statusEffect.counterType === 'number' && (
				<div className={css.turnsRemaining}>
					Number: <span className={css.counter}>{counter}</span>
				</div>
			)}
			{isCounter(statusEffect) && statusEffect.counterType === 'turns' && (
				<div className={css.turnsRemaining}>
					Turns remaining: <span className={css.counter}>{counter}</span>
				</div>
			)}
		</div>
	)
}

export default StatusEffectTooltip
