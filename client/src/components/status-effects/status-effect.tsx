import classnames from 'classnames'
import {isCounter} from 'common/status-effects/status-effect'
import {LocalStatusEffectInstance} from 'common/types/server-requests'
import Tooltip from 'components/tooltip'
import StatusEffectTooltip from './status-effect-tooltip'
import css from './status-effect.module.scss'

interface StatusEffectReactProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	statusEffect: LocalStatusEffectInstance
	counter: number | null
	tooltipAboveModal?: boolean
}

const StatusEffect = (props: StatusEffectReactProps) => {
	const {statusEffect, counter, tooltipAboveModal} = props

	const extension = ['poison', 'fire'].includes(statusEffect.props.icon)
		? '.gif'
		: '.png'
	const statusEffectClass =
		statusEffect.props.type == 'damage'
			? css.damageStatusEffectImage
			: css.statusEffectImage

	return (
		<Tooltip
			tooltip={
				<StatusEffectTooltip
					statusEffect={props.statusEffect}
					counter={counter}
				/>
			}
			showAboveModal={tooltipAboveModal}
		>
			<div className={classnames(css.statusEffect)}>
				<img
					className={statusEffectClass}
					src={'/images/status/' + statusEffect.props.icon + extension}
				></img>
				{isCounter(statusEffect.props) &&
					((statusEffect.props.counterType === 'turns' &&
						statusEffect.props.counter > 1) ||
						statusEffect.props.counterType === 'number') && (
						<p className={css.durationIndicator}>{counter}</p>
					)}
			</div>
		</Tooltip>
	)
}

export default StatusEffect
