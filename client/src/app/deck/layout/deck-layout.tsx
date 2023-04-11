import css from './deck-layout.module.scss'
import {ReactNode} from 'react'
import DeckSidebar from './deck-sidebar'
import DeckMain from './deck-main'

type Props = {
	back: () => void
	title: string
	children?: ReactNode
}

function DeckLayout({children, title, back}: Props) {
	return (
		<div className={css.page}>
			<div className={css.background} />
			<header>
				<div className={css.headerElements}>
					<img
						src="../images/back_arrow.svg"
						alt="back-arrow"
						className={css.headerReturn}
						// onClick={() => back}
						onClick={back}
					/>
					<h1>{title}</h1>
				</div>
			</header>
			<div className={css.body}>
				<div className={css.wrapper}>{children}</div>
			</div>
		</div>
	)
}

DeckLayout.Sidebar = DeckSidebar
DeckLayout.Main = DeckMain

export default DeckLayout
