import React, {ReactNode} from 'react'
import css from './modal.module.scss'
import {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogContent,
	DialogTitle,
	DialogClose,
} from '@radix-ui/react-dialog'
import cn from 'classnames'

type Props = {
	children: React.ReactNode
	description?: string
	closeModal?: () => void
	title?: string
	centered?: boolean
}

function Modal({children, description, closeModal, title, centered}: Props) {
	function pointerDownHandler(event: any) {
		event.preventDefault()
	}
	return (
		<Dialog onOpenChange={closeModal} defaultOpen>
			<DialogPortal container={document.getElementById('modal')}>
				<DialogOverlay className={css.overlay} />
				<DialogContent
					className={cn(css.modal, {[css.center]: centered})}
					aria-describedby={description}
					onPointerDownOutside={pointerDownHandler}
					onEscapeKeyDown={closeModal}
				>
					{title && <DialogTitle className={css.title}>{title}</DialogTitle>}
					{closeModal && (
						<DialogClose className={css.close}>
							<img src="/images/CloseX.svg" alt="close" />
						</DialogClose>
					)}
					{children}
				</DialogContent>
			</DialogPortal>
		</Dialog>
	)
}

type ETNProps = {
	icon: '!' | 'i'
	children: ReactNode
}

export const ModalNotice = ({icon, children}: ETNProps) => {
	return (
		<div className={css.notice}>
			<span className={css.noticeIcon}>{icon}</span>
			<p>{children}</p>
		</div>
	)
}

Modal.Notice = ModalNotice
export default Modal
