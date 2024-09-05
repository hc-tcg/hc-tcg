import classNames from 'classnames'
import React from 'react'
import css from './tooltip.module.scss'

type Props = {
	children: React.ReactElement
	tooltip: React.ReactNode
	showAboveModal?: boolean
}

const Tooltip = ({children, tooltip, showAboveModal}: Props) => {
	return (
		<div className={css.tooltip}>
			<div className={css.tooltipBodyWrapper}>
				<div
					className={classNames(css.tooltipBody, {
						[css.showAboveModal]: showAboveModal,
					})}
				>
					{tooltip}
				</div>
			</div>
			{children}
		</div>
	)
}

export default Tooltip
