import {ReactNode} from 'react'
import css from './deck-layout.module.scss'
import DeckMain from './deck-main'
import DeckSidebar from './deck-sidebar'

type Props = {
	back: () => void
	title: string
	returnText?: string
	children?: ReactNode
}

function DeckLayout({children, title, returnText, back}: Props) {
	return (
		<div className={css.page}>
			<header>
				<div className={css.headerElements}>
					<div className={css.headerReturn} onClick={back}>
						<img src="../images/back_arrow.svg" alt="back-arrow" />
						{returnText && <h2 className={css.hideOnMobile}>{returnText}</h2>}
					</div>
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
