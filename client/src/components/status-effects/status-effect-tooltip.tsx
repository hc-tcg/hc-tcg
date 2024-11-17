import classnames from 'classnames'
import {isCounter} from 'common/status-effects/status-effect'
import {LocalStatusEffectInstance} from 'common/types/server-requests'
import css from './status-effect-tooltip.module.scss'

type Props = {
	statusEffect: LocalStatusEffectInstance
	counter: number | null
}

const StatusEffectTooltip = ({statusEffect, counter}: Props) => {
	let targetClass =
		statusEffect.target.type === 'global' ? css.player : css.card

	return (
		<div>
			<div className={css.topLine}>
				<div className={css.name}>{statusEffect.props.name} </div>
				<div className={classnames(css.tooltip, targetClass)}>
					{statusEffect.target.type === 'card' ? 'Hermit' : 'Global'}
				</div>
			</div>
			<div className={css.description}>{statusEffect.description}</div>
			{isCounter(statusEffect.props) &&
				statusEffect.props.counterType === 'number' && (
					<div className={css.turnsRemaining}>
						Number: <span className={css.counter}>{counter}</span>
					</div>
				)}
			{isCounter(statusEffect.props) &&
				statusEffect.props.counterType === 'turns' &&
				statusEffect.props.counter > 1 && (
					<div className={css.turnsRemaining}>
						Turns remaining: <span className={css.counter}>{counter}</span>
					</div>
				)}
		</div>
	)
}

export default StatusEffectTooltip
