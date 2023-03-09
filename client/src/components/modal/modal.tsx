import React from 'react'
import ReactDOM from 'react-dom'
import css from './modal.module.scss'

type Props = {
	children: React.ReactNode
	closeModal?: () => void
	title?: string
}
function Modal({children, closeModal, title}: Props) {
	const modalEl = document.getElementById('modal')
	if (!modalEl) return null
	return ReactDOM.createPortal(
		<div className={css.modalWrapper}>
			<div className={css.modal}>
				<div className={css.topBevel} />
				<div className={css.rightBevel} />
				<div className={css.bottomBevel} />
				<div className={css.leftBevel} />
				<div className={css.topLine}>
					{title ? <div className={css.title}>{title}</div> : null}
					{closeModal ? (
						<div className={css.closeButton} onClick={closeModal}>
							X
						</div>
					) : null}
				</div>
				<div className={css.content}>{children}</div>
			</div>
		</div>,
		modalEl
	)
}

export default Modal
