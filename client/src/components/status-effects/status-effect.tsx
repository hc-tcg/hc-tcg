import css from './status-effect.module.scss'
import Tooltip from 'components/tooltip'
import StatusEffectTooltip from './status-effect-tooltip'
import StatusEffectClass, {isCounter} from 'common/status-effects/status-effect'

interface StatusEffectReactProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	statusEffect: StatusEffectClass
	counter: number | null
}

const StatusEffect = (props: StatusEffectReactProps) => {
	const {statusEffect, counter} = props

	const extension = ['sleeping', 'poison', 'fire'].includes(statusEffect.props.id) ? '.gif' : '.png'
	const statusEffectClass =
		statusEffect.props.damageEffect == true ? css.damageStatusEffectImage : css.statusEffectImage

	return (
		<Tooltip tooltip={<StatusEffectTooltip statusEffect={props.statusEffect} counter={counter} />}>
			<div className={css.statusEffect}>
				<img
					className={statusEffectClass}
					src={'/images/status/' + statusEffect.props.id + extension}
				></img>
				{isCounter(statusEffect) &&
					((statusEffect.props.counterType === 'turns' && statusEffect.props.counter !== 1) ||
						(statusEffect.props.counterType === 'number' && (
							<p className={css.durationIndicator}>{props.counter}</p>
						)))}
			</div>
		</Tooltip>
	)
}

export default StatusEffect
