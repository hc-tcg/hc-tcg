import classnames from 'classnames'
import {STATUS_EFFECTS} from 'common/status-effects'
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
	let statusEffectProps = STATUS_EFFECTS[statusEffect.id]

	const extension = ['poison', 'fire'].includes(statusEffectProps.icon)
		? '.gif'
		: '.png'
	const statusEffectClass =
		statusEffectProps.type == 'damage'
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
					src={'/images/status/' + statusEffectProps.icon + extension}
				></img>
				{isCounter(statusEffectProps) &&
					((statusEffectProps.counterType === 'turns' &&
						statusEffectProps.counter > 1) ||
						statusEffectProps.counterType === 'number') && (
						<p className={css.durationIndicator}>{counter}</p>
					)}
			</div>
		</Tooltip>
	)
}

export default StatusEffect
