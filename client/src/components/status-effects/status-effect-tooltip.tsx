import {isCounter} from 'common/status-effects/status-effect'
import css from './status-effect-tooltip.module.scss'
import {LocalStatusEffectInstance} from 'common/types/server-requests'
import classnames from 'classnames'

type Props = {
	statusEffect: LocalStatusEffectInstance
	counter: number | null
}

const StatusEffectTooltip = ({statusEffect, counter}: Props) => {
	let targetClass = statusEffect.target.type === 'player' ? css.player : css.card

	return (
		<div className={css.statusEffectTooltip}>
			<div className={css.topLine}>
				<div className={css.name}>{statusEffect.props.name} </div>
				<div className={classnames(css.tooltip, targetClass)}>
					{statusEffect.target.type === 'card' ? 'Hermit' : 'Player'}
				</div>
			</div>
			<div className={css.description}>{statusEffect.props.description}</div>
			{isCounter(statusEffect.props) && statusEffect.props.counterType === 'number' && (
				<div className={css.turnsRemaining}>
					Number: <span className={css.counter}>{counter}</span>
				</div>
			)}
			{isCounter(statusEffect.props) && statusEffect.props.counterType === 'turns' && (
				<div className={css.turnsRemaining}>
					Turns remaining: <span className={css.counter}>{counter}</span>
				</div>
			)}
		</div>
	)
}

export default StatusEffectTooltip
