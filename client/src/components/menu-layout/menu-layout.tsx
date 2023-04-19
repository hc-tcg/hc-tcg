import css from './menu-layout.module.scss'
import {ReactNode} from 'react'

type Props = {
	back: () => void
	title: string
	returnText?: string
	children?: ReactNode
}

function MenuLayout({children, title, returnText, back}: Props) {
	return (
		<>
			<header className={css.header}>
				<div className={css.back} onClick={back}>
					<img src="../images/back_arrow.svg" alt="back-arrow" />
					{returnText && <p>{returnText}</p>}
				</div>
				<h1>{title}</h1>
			</header>
			<div className={css.content}>{children}</div>
		</>
	)
}

export default MenuLayout
