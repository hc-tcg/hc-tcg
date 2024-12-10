import cn from 'classnames'
import {ButtonVariant} from 'common/types/buttons'
import Button from 'components/button'
import {ReactNode, useEffect, useRef} from 'react'
import css from './modal.module.scss'

type ModalProps = {
	overlayClassName?: string
	modalClassName?: string
	children: ReactNode
	/** Controls whether the modal is visible or not */
	setOpen: boolean
	/** Called when the modal should close */
	onClose: () => void
	/** Sets the modal title. If this is undefined the title bar will be hidden. */
	title?: string
	/** If true, the modal will not have a close button in the corner that can be clicked. */
	disableCloseButton?: boolean
	/** If true, the modal will not close when the ESC button is pressed. */
	disableCloseOnEsc?: boolean
	/** If true, the modal will not close when the overlay around it is clicked. */
	disableCloseOnOverlayClick?: boolean
	/** If true, The close button will be hidden and the user will not be able to close the modal in any way. Overrides `disableCloseButton`, `disableCloseOnEsc`, and `disableCloseOnOverlayClick` to `true`. */
	disableUserClose?: boolean
	/** If true, makes the modal take up 75% of the screen width*/
	veryWide?: boolean
}

export function Modal({
	overlayClassName,
	modalClassName,
	children,
	setOpen,
	onClose,
	title,
	disableCloseButton = false,
	disableCloseOnEsc = false,
	disableCloseOnOverlayClick = false,
	disableUserClose = false,
	veryWide = false,
}: ModalProps) {
	if (!setOpen) return

	const childrenRef = useRef(null)

	if (disableUserClose) {
		disableCloseButton = true
		disableCloseOnEsc = true
		disableCloseOnOverlayClick = true
	}

	// FOCUS TRAPPING

	let focusableModalElements: any = []
	let firstElement: any = null
	let lastElement: any = null

	useEffect(() => {
		// https://medium.com/cstech/achieving-focus-trapping-in-a-react-modal-component-3f28f596f35b
		focusableModalElements = (childrenRef as any).current?.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		)
		if (!focusableModalElements) return
		if (focusableModalElements.length === 0) return
		focusableModalElements[focusableModalElements.length - 1].focus()
		firstElement = focusableModalElements[0]
		lastElement = focusableModalElements[focusableModalElements.length - 1]
	}, [childrenRef])

	// KEY HANDLING

	function handleKeys(ev: KeyboardEvent) {
		if (!disableCloseOnEsc && ev.key === 'Escape') {
			onClose()
		}

		// https://dev.to/mohitkyadav/how-to-trap-focus-in-react-3in8
		if (ev.key === 'Tab') {
			if (
				![...focusableModalElements.values()].includes(
					document.activeElement,
				) &&
				lastElement
			) {
				lastElement.focus()
			} else if (
				!ev.shiftKey &&
				document.activeElement === lastElement &&
				firstElement
			) {
				firstElement.focus()
				ev.preventDefault()
			} else if (
				ev.shiftKey &&
				document.activeElement === firstElement &&
				lastElement
			) {
				lastElement.focus()
				ev.preventDefault()
			}
		}
	}

	useEffect(() => {
		window.addEventListener('keydown', handleKeys)
		return () => {
			window.removeEventListener('keydown', handleKeys)
		}
	}, [handleKeys])

	return (
		<>
			<div
				className={cn(css.overlay, overlayClassName)}
				onClick={!disableCloseOnOverlayClick ? onClose : undefined}
			/>
			<div
				className={cn(
					css.modal,
					modalClassName,
					veryWide === true && css.veryWide,
				)}
			>
				{title && (
					<div className={css.title}>
						{title && <span>{title}</span>}
						{/* When tabbing around it is more convenient to click the buttons only */}
						{!disableCloseButton && (
							<button className={css.close} tabIndex={-1} onClick={onClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						)}
					</div>
				)}
				<div ref={childrenRef}> {children} </div>
			</div>
		</>
	)
}

type ComponentProps = {
	className?: string
	children: ReactNode
}

type NoticeProps = ComponentProps & {
	icon: '!' | 'i'
}

/** Pre-styled notice component for modals */
Modal.Notice = ({className, children, icon}: NoticeProps) => {
	const childrenRef = useRef(null)
	return (
		<div className={css.notice}>
			<span className={cn(css.noticeIcon, className)}>{icon}</span>
			<p ref={childrenRef}>{children}</p>
		</div>
	)
}
/** Pre-styled description component for modals */
Modal.Description = ({className, children}: ComponentProps) => {
	const childrenRef = useRef(null)
	return (
		<div className={cn(css.description, className)} ref={childrenRef}>
			{children}
		</div>
	)
}

type OptionsProps = ComponentProps & {
	/** Stretch buttons to fill available width. If this is not enabled each button is limited to 50% width. */
	fillSpace?: boolean
}

/** Pre-styled options component for modals. Add `Button` components as children. */
Modal.Options = ({className, children, fillSpace}: OptionsProps) => {
	const childrenRef = useRef(null)
	return (
		<div
			className={cn(css.options, fillSpace && css.fillSpace, className)}
			ref={childrenRef}
		>
			{children}
		</div>
	)
}

type ConfirmModalProps = {
	/** Controls whether the modal is visible or not */
	setOpen: boolean
	/** Sets the modal title. If this is undefined the title bar will be hidden. */
	title: string
	/** Sets the modal description */
	description: string
	/** Sets the text for the cancel button. Default is "Cancel" */
	cancelButtonText?: string
	/** Sets the text for the confirm button. Default is "Confirm" */
	confirmButtonText?: string
	/** Sets the design variant for the confirm button. Default is... well, "default" */
	cancelButtonVariant?: ButtonVariant
	/** Sets the design variant for the confirm button. Default is "error" */
	confirmButtonVariant?: ButtonVariant
	/** Called when the action is canceled and the modal closed, either by the button or otherwise */
	onCancel: () => void
	/** Called when the confirm button is pressed */
	onConfirm: () => void
}

/** Simplified Modal component specifically for confirming an action */
export function ConfirmModal({
	setOpen,
	title,
	description,
	cancelButtonText = 'Cancel',
	confirmButtonText = 'Confirm',
	cancelButtonVariant = 'default',
	confirmButtonVariant = 'error',
	onCancel,
	onConfirm,
}: ConfirmModalProps) {
	return (
		<Modal
			setOpen={setOpen}
			title={title}
			onClose={onCancel}
			disableCloseButton
		>
			<Modal.Description>{description}</Modal.Description>
			<Modal.Options>
				<Button variant={cancelButtonVariant} onClick={onCancel}>
					{cancelButtonText}
				</Button>
				<Button variant={confirmButtonVariant} onClick={onConfirm}>
					{confirmButtonText}
				</Button>
			</Modal.Options>
		</Modal>
	)
}

type AlertModalProps = {
	/** Controls whether the modal is visible or not */
	setOpen: boolean
	/** Sets the modal title. If this is undefined the title bar will be hidden. */
	title: string
	/** Sets the modal description */
	description: string
	/** Sets the text for the close button. Default is "Ok" */
	closeButtonText?: string
	/** Sets the design variant for the confirm button. Default is "default" */
	closeButtonVariant?: ButtonVariant
	/** Called when the close button is pressed */
	onClose: () => void
}

/** Simplified Modal component specifically to show an alert message */
export function AlertModal({
	setOpen,
	title,
	description,
	closeButtonText = 'Ok',
	closeButtonVariant = 'default',
	onClose,
}: AlertModalProps) {
	return (
		<Modal setOpen={setOpen} title={title} onClose={onClose} disableCloseButton>
			<Modal.Description>{description}</Modal.Description>
			<Modal.Options fillSpace>
				<Button variant={closeButtonVariant} onClick={onClose}>
					{closeButtonText}
				</Button>
			</Modal.Options>
		</Modal>
	)
}
