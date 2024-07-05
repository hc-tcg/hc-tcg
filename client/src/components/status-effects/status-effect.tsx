import cn from 'classnames'
import css from './status-effect.module.scss'
import Tooltip from 'components/tooltip'
import StatusEffectTooltip from './status-effect-tooltip'
import StatusEffectClass from 'common/status-effects/status-effect'

interface StatusEffectProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	statusEffect: StatusEffectClass
	counter: number | null
}

const StatusEffect = (props: StatusEffectProps) => {
	console.log(props)
	const {id, damageEffect} = props.statusEffect.props

	const extension = ['sleeping', 'poison', 'fire'].includes(id) ? '.gif' : '.png'
	const statusEffectClass =
		damageEffect == true ? css.damageStatusEffectImage : css.statusEffectImage

	return (
		<Tooltip
			tooltip={<StatusEffectTooltip statusEffect={props.statusEffect} counter={props.counter} />}
		>
			<div className={css.statusEffect}>
				<img className={statusEffectClass} src={'/images/status/' + id + extension}></img>
				{props.counter !== null && <p className={css.durationIndicator}>{props.counter}</p>}
			</div>
		</Tooltip>
	)
}

export default StatusEffect
