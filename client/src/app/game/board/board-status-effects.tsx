import classNames from 'classnames'
import {LocalStatusEffectInstance} from 'common/types/server-requests'
import StatusEffect from 'components/status-effects/status-effect'
import Tooltip from 'components/tooltip'
import statusEffectImageCss from '../../../components/status-effects/status-effect.module.scss'
import css from './board.module.scss'

type ExpandStatusEffectProps = {
	statusEffects: Array<any>
	tooltipAboveModal?: boolean
}

const ExpandStatusEffect = ({
	statusEffects,
	tooltipAboveModal,
}: ExpandStatusEffectProps) => {
	let tooltipWindow = (
		<div>
			<div className={css.expandStatusEffects}>
				<div className={css.expandStatusEffectGrid}> {statusEffects} </div>
			</div>
		</div>
	)

	return (
		<Tooltip tooltip={tooltipWindow} showAboveModal={tooltipAboveModal}>
			<div className={statusEffectImageCss.statusEffect}>
				<img
					src="images/status/expand.png"
					className={statusEffectImageCss.statusEffectImage}
				/>
			</div>
		</Tooltip>
	)
}

type StatusEffectDisplayProps = {
	shouldDim?: boolean
	statusEffects: Array<LocalStatusEffectInstance>
	forHermit?: boolean
	tooltipAboveModal?: boolean
}

/** An object to display status effect for a specific card */
const StatusEffectContainer = ({
	shouldDim,
	statusEffects,
	forHermit,
	tooltipAboveModal,
}: StatusEffectDisplayProps) => {
	let classes
	if (!forHermit) {
		classes = classNames(css.statusEffectContainer)
	} else {
		classes = classNames(css.statusEffectContainerForHermit, {
			[statusEffectImageCss.dimmed]: shouldDim,
		})
	}

	// We want to show the newest status effect first in the list.
	statusEffects = [...statusEffects].reverse()

	let sidebarStatusEffects = statusEffects.map((effect) => {
		if (effect.props.type === 'damage' || effect.props.type === 'hiddenSystem')
			return
		return (
			<StatusEffect
				key={effect.instance}
				statusEffect={effect}
				counter={effect.counter}
				tooltipAboveModal={tooltipAboveModal}
			/>
		)
	})

	if (sidebarStatusEffects.length > 4) {
		sidebarStatusEffects = [
			...sidebarStatusEffects.slice(0, 3),
			<ExpandStatusEffect
				statusEffects={sidebarStatusEffects}
				tooltipAboveModal={tooltipAboveModal}
			/>,
		]
	}

	return <div className={classes}>{sidebarStatusEffects.slice(0, 4)}</div>
}

export default StatusEffectContainer
