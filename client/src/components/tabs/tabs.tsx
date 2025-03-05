import classNames from 'classnames'
import css from './tabs.module.scss'

type BaseProps = {
	selected: string
	setSelected: (str: any) => void
	tabs: Array<string>
}

type Props =
	| (BaseProps & {
			vertical?: undefined
			verticalDirection?: 'left' | 'right'
	  })
	| (BaseProps & {
			vertical: boolean
			verticalDirection: 'left' | 'right'
	  })

function Tabs({
	selected,
	setSelected,
	tabs,
	vertical,
	verticalDirection,
}: Props) {
	return (
		<div className={classNames(css.tabs, {[css.vertical]: vertical})}>
			{tabs.map((tab) => {
				return (
					<div
						className={classNames(
							css.tab,
							selected === tab ? css.selected : css.deselected,
							{
								[verticalDirection === 'left' ? css.left : css.right]: vertical,
							},
						)}
						onClick={() => {
							if (selected !== tab) setSelected(tab)
						}}
						key={tab}
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
