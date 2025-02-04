import classNames from 'classnames'
import {ReactNode, useRef, useState} from 'react'
import css from './accordion.module.scss'

type Props = {
	header: ReactNode
	children: ReactNode
	defaultOpen?: boolean
}

function Accordion({header, children, defaultOpen}: Props) {
	const [isOpen, setIsOpen] = useState<boolean>(
		defaultOpen === undefined ? true : defaultOpen,
	)

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
