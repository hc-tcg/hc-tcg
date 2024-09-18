import classNames from 'classnames'
import {ReactNode} from 'react'
import css from './deck-main.module.scss'

type Props = {
	children: ReactNode
	mobileChildren?: ReactNode
	header?: ReactNode
}

function DeckMain({children, header, mobileChildren}: Props) {
	return (
		<section className={css.deck}>
			<div
				className={classNames(css.header, mobileChildren ? css.desktop : '')}
			>
				{header}
			</div>

			<div className={classNames(css.body, mobileChildren ? css.desktop : '')}>
				{children}
			</div>
			{mobileChildren && (
				<div className={css.mobile}>
					<div className={css.body}>{mobileChildren}</div>
				</div>
			)}
		</section>
	)
}

export default DeckMain
