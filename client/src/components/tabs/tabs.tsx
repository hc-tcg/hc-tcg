import classNames from 'classnames'
import css from './tabs.module.scss'

function Tabs({
	selected,
	setSelected,
	tabs,
}: {
	selected: string
	setSelected: (str: string) => void
	tabs: Array<string>
}) {
	return (
		<div className={css.tabs}>
			{tabs.map((tab) => {
				return (
					<div
						className={classNames(
							css.tab,
							selected === tab ? css.selected : css.deselected,
						)}
						onClick={() => {
							if (selected !== tab) setSelected(tab)
						}}
					>
						{tab}
					</div>
				)
			})}
			<div className={css.afterTabs}></div>
		</div>
	)
}

export default Tabs
