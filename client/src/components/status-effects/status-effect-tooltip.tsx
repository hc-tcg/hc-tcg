import classnames from 'classnames'
import {STATUS_EFFECTS} from 'common/status-effects'
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

	let statusEffectProps = STATUS_EFFECTS[statusEffect.id]

	return (
		<div>
			<div className={css.topLine}>
				<div className={css.name}>{statusEffectProps.name} </div>
				<div className={classnames(css.tooltip, targetClass)}>
					{statusEffect.target.type === 'card' ? 'Hermit' : 'Global'}
				</div>
			</div>
			<div className={css.description}>{statusEffect.description}</div>
			{isCounter(statusEffectProps) &&
				statusEffectProps.counterType === 'number' && (
					<div className={css.turnsRemaining}>
						Number: <span className={css.counter}>{counter}</span>
					</div>
				)}
			{isCounter(statusEffectProps) &&
				statusEffectProps.counterType === 'turns' &&
				statusEffectProps.counter > 1 && (
					<div className={css.turnsRemaining}>
						Turns remaining: <span className={css.counter}>{counter}</span>
					</div>
				)}
		</div>
	)
}

export default StatusEffectTooltip
