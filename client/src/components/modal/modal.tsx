import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
} from '@radix-ui/react-dialog'
import cn from 'classnames'
import React, {ReactNode} from 'react'
import css from './modal.module.scss'

type Props = {
	children: React.ReactNode
	description?: string
	closeModal: () => void
	title?: string
	centered?: boolean
	showCloseButton?: boolean
}

function Modal({
	children,
	description,
	closeModal,
	title,
	centered,
	showCloseButton = true,
}: Props) {
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
					onEscapeKeyDown={(ev) => {
						if (showCloseButton) {
							closeModal()
						} else {
							ev.preventDefault()
						}
					}}
				>
					{title && <DialogTitle className={css.title}>{title}</DialogTitle>}
					{/* When tabbing around it is more convient to click the buttons only */}
					{showCloseButton && (
						<DialogClose className={css.close} tabIndex={-1}>
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
