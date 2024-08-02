import {ReactNode} from 'react'
import css from './menu-layout.module.scss'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	back: () => void
	title: string
	returnText?: string
	children?: ReactNode
	attributes?: HTMLDivElement
}

function MenuLayout({children, title, returnText, back, ...attributes}: Props) {
	return (
		<>
			<header className={css.header}>
				<div className={css.back} onClick={back}>
					<img src="../images/back_arrow.svg" alt="back-arrow" />
					{returnText && <p>{returnText}</p>}
				</div>
				<h1>{title}</h1>
			</header>
			<div {...attributes} className={`${css.content} ${attributes.className}`}>
				{children}
			</div>
		</>
	)
}

export default MenuLayout
