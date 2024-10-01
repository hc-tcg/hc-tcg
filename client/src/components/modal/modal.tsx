import cn from 'classnames'
import React, {ReactNode, useEffect, useRef} from 'react'
import css from './modal.module.scss'

type Props = {
	children: React.ReactNode
	closeModal: () => void
	title?: string
	centered?: boolean
	showCloseButton?: boolean
}

function Modal({
	children,
	closeModal,
	title,
	centered,
	showCloseButton = true,
}: Props) {
	const childrenRef = useRef(null)

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

	function handleKeys(e: any) {
		if (e.key === 'Escape') {
			closeModal()
		}

		// https://dev.to/mohitkyadav/how-to-trap-focus-in-react-3in8
		if (e.key === 'Tab') {
			if (
				![...focusableModalElements.values()].includes(
					document.activeElement,
				) &&
				lastElement
			) {
				lastElement.focus()
			} else if (
				!e.shiftKey &&
				document.activeElement === lastElement &&
				firstElement
			) {
				firstElement.focus()
				e.preventDefault()
			} else if (
				e.shiftKey &&
				document.activeElement === firstElement &&
				lastElement
			) {
				lastElement.focus()
				e.preventDefault()
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
			<div className={css.overlay} />
			<div className={cn(css.modal, {[css.center]: centered})}>
				<div className={css.title}>
					{title && <span>{title}</span>}
					{/* When tabbing around it is more convient to click the buttons only */}
					{showCloseButton && (
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
