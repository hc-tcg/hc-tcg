import classNames from 'classnames'
import {ReactNode, useState} from 'react'
import css from './deck-sidebar.module.scss'

type Props = {
	children: ReactNode
	header?: ReactNode
	footer?: ReactNode
	width?: 'normal' | 'half'
	showHeader: boolean
	showHeaderOnMobile: boolean
}

function DeckSidebar({
	children,
	header,
	footer,
	width,
	showHeader,
	showHeaderOnMobile,
}: Props) {
	const [active, setActive] = useState<boolean>(true)

	return (
		<section className={classNames(css.sidebar, width && css[width])}>
			{showHeader && (
				<div
					className={classNames(
						css.header,
						!showHeaderOnMobile && css.hideOnMobile,
					)}
				>
					{header}
					<button
						className={classNames(
							css.toggle,
							!active && css.open,
							css.showOnMobile,
						)}
						onClick={() => setActive(!active)}
					>
						<img src="/images/card-icon.png" className={css.toggleImage}></img>
					</button>
				</div>
			)}
			<div className={classNames(css.bodyWrapper, active && css.hide)}>
				<div className={css.body}>{children}</div>
				{footer}
			</div>
		</section>
	)
}

export default DeckSidebar
