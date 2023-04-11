import {ReactNode, useState} from 'react'
import classNames from 'classnames'
import css from './deck-sidebar.module.scss'
import {KebabMenuIcon} from 'components/svgs'

type Props = {
	children: ReactNode
	header?: ReactNode
	footer?: ReactNode
	width?: 'normal' | 'half'
}

function DeckSidebar({children, header, footer, width}: Props) {
	const [active, setActive] = useState<boolean>(true)

	return (
		<section className={classNames(css.sidebar, width && css[width])}>
			<div className={css.header}>
				{header}
				<button className={css.toggle} onClick={() => setActive(!active)}>
					<KebabMenuIcon />
				</button>
			</div>

			<div className={classNames(css.bodyWrapper, active && css.hide)}>
				<div className={css.body}>{children}</div>
				{footer}
			</div>
		</section>
	)
}

export default DeckSidebar
