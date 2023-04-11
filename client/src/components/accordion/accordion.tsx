import classNames from 'classnames'
import {ReactNode, useState} from 'react'
import css from './accordion.module.css'

type Props = {
	header: ReactNode
	children: ReactNode
}

function Accordion({header, children}: Props) {
	const [isOpen, setIsOpen] = useState<boolean>(true)

	return (
		<div className={css.accordion}>
			<div className={css.header} onClick={() => setIsOpen(!isOpen)}>
				{header}
				<span />
				<img
					src="../images/caret-down.svg"
					alt="caret-down"
					className={css.caret}
					style={isOpen ? {} : {transform: 'rotate(-180deg)'}}
				/>
			</div>
			<div
				className={classNames(css.content, !isOpen ? css.hide : '')}
				aria-hidden={!isOpen ? 'true' : 'false'}
			>
				<div className={css.padding}>{children}</div>
			</div>
		</div>
	)
}

export default Accordion
