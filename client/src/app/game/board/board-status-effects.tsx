import css from './board.module.scss'
import StatusEffect from 'components/status-effects/status-effect'
import {LocalStatusEffectInstance} from 'common/types/server-requests'
import classNames from 'classnames'

type StatusEffectDisplayProps = {
	statusEffects: Array<LocalStatusEffectInstance>
	forHermit?: boolean
}

/** An object to display status effect for a specific card */
const StatusEffectContainer = ({statusEffects, forHermit}: StatusEffectDisplayProps) => {
	let classes
	if (!forHermit) {
		classes = classNames(css.statusEffectContainer)
	} else {
		classes = classNames(css.statusEffectContainerForHermit)
	}

	// We want to show the newest status effect first in the list.
	statusEffects = [...statusEffects].reverse()

	return (
		<div>
			<div className={classes}>
				{statusEffects.map((effect) => {
					if (effect.props.type === 'damage' || effect.props.type === 'hiddenSystem') return
					return (
						<StatusEffect key={effect.instance} statusEffect={effect} counter={effect.counter} />
					)
				})}
			</div>
			<div className={css.damageStatusEffectContainer}>
				{statusEffects.map((effect) => {
					if (effect.props.type !== 'damage') return
					return (
						<StatusEffect key={effect.instance} statusEffect={effect} counter={effect.counter} />
					)
				})}
			</div>
		</div>
	)
}

export default StatusEffectContainer
