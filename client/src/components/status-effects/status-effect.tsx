import css from './status-effect.module.scss'
import Tooltip from 'components/tooltip'
import StatusEffectTooltip from './status-effect-tooltip'
import {StatusEffectProps, isCounter} from 'common/status-effects/status-effect'

interface StatusEffectReactProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	statusEffect: StatusEffectProps
	counter: number | null
}

const StatusEffect = (props: StatusEffectReactProps) => {
	const {statusEffect, counter} = props

	const extension = ['sleeping', 'poison', 'fire'].includes(statusEffect.icon) ? '.gif' : '.png'
	const statusEffectClass =
		statusEffect.type == 'damage' ? css.damageStatusEffectImage : css.statusEffectImage

	return (
		<Tooltip tooltip={<StatusEffectTooltip statusEffect={props.statusEffect} counter={counter} />}>
			<div className={css.statusEffect}>
				<img
					className={statusEffectClass}
					src={'/images/status/' + statusEffect.icon + extension}
				></img>
				{isCounter(statusEffect) &&
					((statusEffect.counterType === 'turns' && statusEffect.counter !== 1) ||
						statusEffect.counterType === 'number') && (
						<p className={css.durationIndicator}>{counter}</p>
					)}
			</div>
		</Tooltip>
	)
}

export default StatusEffect
