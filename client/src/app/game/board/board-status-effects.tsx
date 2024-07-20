import css from './board.module.scss'
import statusEffectImageCss from '../../../components/status-effects/status-effect.module.scss'
import StatusEffect from 'components/status-effects/status-effect'
import {LocalStatusEffectInstance} from 'common/types/server-requests'
import classNames from 'classnames'
import Tooltip from 'components/tooltip'

type ExpandStatusEffectProps = {
	statusEffects: Array<any>
}

const ExpandStatusEffect = ({statusEffects}: ExpandStatusEffectProps) => {
	let tooltipWindow = (
		<div>
			<div className={css.expandStatusEffects}>
				<div className={css.expandStatusEffectGrid}> {statusEffects} </div>
			</div>
		</div>
	)

	return (
		<Tooltip tooltip={tooltipWindow}>
			<div className={statusEffectImageCss.statusEffect}>
				<img src="images/status/expand.png" className={statusEffectImageCss.statusEffectImage} />
			</div>
		</Tooltip>
	)
}

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

	let sidebarStatusEffects = statusEffects.map((effect) => {
		if (effect.props.type === 'damage' || effect.props.type === 'hiddenSystem') return
		return <StatusEffect key={effect.instance} statusEffect={effect} counter={effect.counter} />
	})

	if (sidebarStatusEffects.length > 4) {
		sidebarStatusEffects = [
			...sidebarStatusEffects.slice(0, 3),
			<ExpandStatusEffect statusEffects={sidebarStatusEffects} />,
		]
	}

	return (
		<div>
			<div className={classes}>{sidebarStatusEffects.slice(0, 4)}</div>
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
