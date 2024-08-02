import classNames from 'classnames'
import {KebabMenuIcon} from 'components/svgs'
import {ReactNode, useState} from 'react'
import css from './deck-sidebar.module.scss'

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
				<button
					className={classNames(css.toggle, !active && css.open)}
					onClick={() => setActive(!active)}
				>
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
