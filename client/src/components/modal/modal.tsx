import React, {ReactNode} from 'react'
import css from './modal.module.scss'
import * as Dialog from '@radix-ui/react-dialog'
import cn from 'classnames'

type Props = {
	children: React.ReactNode
	description?: string
	closeModal: () => void
	title?: string
	centered?: boolean
}

function Modal({children, description, closeModal, title, centered}: Props) {
	return (
		<Dialog.Root open={true} onOpenChange={closeModal}>
			<Dialog.Portal container={document.getElementById('modal')}>
				<Dialog.Overlay className={css.overlay} />
				<Dialog.Content
					className={cn(css.modal, {[css.center]: centered})}
					aria-describedby={description}
				>
					{title && <Dialog.Title className={css.title}>{title}</Dialog.Title>}
					<Dialog.Close className={css.close}>
						<img src="/images/CloseX.svg" alt="close" />
					</Dialog.Close>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
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
