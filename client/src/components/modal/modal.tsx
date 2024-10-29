import {ReactNode, useEffect, useRef} from 'react'
import css from './modal.module.scss'
import cn from 'classnames'

type Props = {
	children: ReactNode
	closeModal: () => void
	title: string
	/** If true, the modal will not have a close button in the corner that can be clicked. */
	disableCloseButton?: boolean
	/** If true, the modal will not close when the ESC button is pressed. */
	disableCloseOnEsc?: boolean
	/** If true, the modal will not close when the overlay around it is clicked. */
	disableCloseOnOverlayClick?: boolean
	/** If true, The close button will be hidden and the user will not be able to close the modal in any way. Overrides `disableCloseButton`, `disableCloseOnEsc`, and `disableCloseOnOverlayClick` to `true`. */
	disableUserClose?: boolean
}

function Modal({
	children,
	closeModal,
	title,
	disableCloseButton = false,
	disableCloseOnEsc = false,
	disableCloseOnOverlayClick = false,
	disableUserClose = false,
}: Props) {
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
			closeModal()
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
				className={css.overlay}
				onClick={!disableCloseOnOverlayClick ? closeModal : undefined}
			/>
			<div className={css.modal}>
				<div className={css.title}>
					{title && <span>{title}</span>}
					{/* When tabbing around it is more convient to click the buttons only */}
					{!disableCloseButton && (
						<button className={css.close} tabIndex={-1} onClick={closeModal}>
							<img src="/images/CloseX.svg" alt="close" />
						</button>
					)}
				</div>
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

/** Pre-styled options component for modals */
// @TODO Make this a proper component with no need for children
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
export default Modal
