import Ailment from "common/ailments/ailment"
import React from 'react'
import classnames from 'classnames'
import css from './ailment-tooltip.module.scss'

type Props = {
	ailment: Ailment
    duration?: number | undefined
}

const AilmentTooltip = ({ailment, duration}: Props) => {
	return (
		<div className={css.ailmentTooltip}>
			<div className={css.topLine}>
				<div className={css.name}>{ailment.name}</div>
			</div>
			<div className={css.description}>
				{ailment.description}
			</div>
			{(duration !== undefined && ailment.counter) && 
				<div className={css.turnsRemaining}>Number: <span className={css.duration}>{duration}</span></div>
			}
			{(duration !== undefined && !ailment.counter) && 
				<div className={css.turnsRemaining}>Turns remaining: <span className={css.duration}>{duration}</span></div>
			}
		</div>
	)
}

export default AilmentTooltip