import {ReactNode} from 'react'
import css from './deck-main.module.scss'

type Props = {
	children: ReactNode
	header?: ReactNode
}

function DeckMain({children, header}: Props) {
	return (
		<section className={css.deck}>
			<div className={css.header}>{header}</div>

			<div className={css.body}>{children}</div>
		</section>
	)
}

export default DeckMain
