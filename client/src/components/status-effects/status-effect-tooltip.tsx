import StatusEffect, {isCounter} from 'common/status-effects/status-effect'
import css from './status-effect-tooltip.module.scss'

type Props = {
	statusEffect: StatusEffect
	counter: number | null
}

const StatusEffectTooltip = ({statusEffect, counter}: Props) => {
	return (
		<div className={css.statusEffectTooltip}>
			<div className={css.topLine}>
				<div className={css.name}>{statusEffect.props.name}</div>
			</div>
			<div className={css.description}>{statusEffect.props.description}</div>
			{isCounter(statusEffect) && statusEffect.props.counterType === 'number' && (
				<div className={css.turnsRemaining}>
					Number: <span className={css.counter}>{counter}</span>
				</div>
			)}
			{isCounter(statusEffect) && statusEffect.props.counterType === 'turns' && (
				<div className={css.turnsRemaining}>
					Turns remaining: <span className={css.counter}>{counter}</span>
				</div>
			)}
		</div>
	)
}

export default StatusEffectTooltip
