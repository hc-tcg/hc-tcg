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
		<div className={css.cardTooltip}>
			<div className={css.topLine}>
				{ailment.name}
			</div>
			<div className={css.description}>
				{ailment.description}
                {duration && 
                    <div>
                        Turns remaining: {duration}
                    </div>
                }
			</div>
		</div>
	)
}

export default AilmentTooltip