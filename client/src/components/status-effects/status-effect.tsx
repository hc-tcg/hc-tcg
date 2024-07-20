import css from './status-effect.module.scss'
import Tooltip from 'components/tooltip'
import StatusEffectTooltip from './status-effect-tooltip'
import {isCounter} from 'common/status-effects/status-effect'
import {LocalStatusEffectInstance} from 'common/types/server-requests'

interface StatusEffectReactProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	statusEffect: LocalStatusEffectInstance
	counter: number | null
}

const StatusEffect = (props: StatusEffectReactProps) => {
	const {statusEffect, counter} = props

	const extension = ['sleeping', 'poison', 'fire'].includes(statusEffect.props.icon)
		? '.gif'
		: '.png'
	const statusEffectClass =
		statusEffect.props.type == 'damage' ? css.damageStatusEffectImage : css.statusEffectImage

	return (
		<Tooltip tooltip={<StatusEffectTooltip statusEffect={props.statusEffect} counter={counter} />}>
			<div className={css.statusEffect}>
				<img
					className={statusEffectClass}
					src={'/images/status/' + statusEffect.props.icon + extension}
				></img>
				{isCounter(statusEffect.props) &&
					((statusEffect.props.counterType === 'turns' && statusEffect.counter !== 1) ||
						statusEffect.props.counterType === 'number') && (
						<p className={css.durationIndicator}>{counter}</p>
					)}
			</div>
		</Tooltip>
	)
}

export default StatusEffect
