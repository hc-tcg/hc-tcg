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
			{/* {counter !== null && statusEffect.props.counter && (
				<div className={css.turnsRemaining}>
					Number: <span className={css.duration}>{duration}</span>
				</div>
			)} */}
			{counter !== null && isCounter(statusEffect) && (
				<div className={css.turnsRemaining}>
					Turns remaining: <span className={css.duration}>{counter}</span>
				</div>
			)}
		</div>
	)
}

export default StatusEffectTooltip
