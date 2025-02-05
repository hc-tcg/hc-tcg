import classNames from 'classnames'
import {ReactElement, useEffect, useReducer, useRef, useState} from 'react'
import css from './hermit-button.module.scss'

interface HermitbuttonProps {
	image: string
	title: string
	mode: string
	selectedMode: string | null
	setSelectedMode: (key: string | null) => void
	backgroundImage: string
	description: string
	children: ReactElement
	onReturn?: () => void
}

const HermitButton = ({
	image,
	title,
	description,
	mode,
	selectedMode,
	setSelectedMode,
	backgroundImage,
	children,
	onReturn,
}: HermitbuttonProps) => {
	const buttonRef = useRef<HTMLDivElement>(null)
	const backgroundRef = useRef<HTMLDivElement>(null)
	const rightOverlayRef = useRef<HTMLDivElement>(null)
	const returnButtonRef = useRef<HTMLDivElement>(null)

	const [lastMode, setLastMode] = useState<string | null>(null)

	const [buttonPosition, setButtonPosition] = useState<{
		x: number
		y: number
		h: number
		w: number
	} | null>(null)
	const [, reload] = useReducer((x) => x + 1, 0)

	const handleResize = () => {
		if (!buttonRef.current || !backgroundRef.current) {
			reload()
		} else {
			const pos = buttonRef.current.getBoundingClientRect()
			setButtonPosition({x: pos.x, y: pos.y, h: pos.height, w: pos.width})

			if (selectedMode === mode) {
				const width = 'min(max(45vw, 70vh), 80vw)'
				backgroundRef.current.style.translate = `calc((100vw - ${width}) / 2) 0`
			} else {
				backgroundRef.current.style.translate = `${pos.x}px 0`
			}
		}
	}

	useEffect(() => {
		if (!buttonPosition) {
			handleResize()
		}
		window.addEventListener('resize', handleResize)

		// Clean up event listeners
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	})
	const grow = () => {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (!background || !button || !buttonPosition) return

		button.classList.remove(css.enablePointer)
		button.classList.add(css.disablePointer)

		background.classList.remove(css.shrink, css.show, css.hide)
		background.classList.add(css.grow)

		const width = 'min(max(45vw, 70vh), 80vw)'
		background.style.translate = `calc((100vw - ${width}) / 2) 0`
	}

	const shrink = () => {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (!background || !buttonPosition || !button) return

		button.classList.remove(css.disablePointer)
		button.classList.add(css.enablePointer)

		background.classList.remove(css.grow, css.show, css.hide)
		background.classList.add(css.shrink)

		background.style.translate = `${buttonPosition.x}px 0`
	}

	const hide = () => {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (!background || !button || !buttonPosition) return

		button.classList.remove(css.enablePointer)
		button.classList.add(css.disablePointer)

		background.classList.remove(css.shrink, css.grow, css.show)
		background.classList.add(css.hide)

		background.style.translate = `${buttonPosition.x}px 0`
	}
	const show = () => {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (!background || !button || !buttonPosition) return

		button.classList.remove(css.disablePointer)
		button.classList.add(css.enablePointer)

		background.classList.remove(css.hide, css.grow, css.shrink)
		background.classList.add(css.show)

		background.style.translate = `${buttonPosition.x}px 0`
	}

	if (selectedMode != lastMode) {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (buttonPosition && background && button) {
			if (selectedMode === mode) {
				// Only trigger a change when the selected mode changed

				grow()
			} else if (selectedMode && selectedMode !== mode) {
				hide()
			} else if (selectedMode === null) {
				if (lastMode == mode) {
					shrink()
				} else {
					show()
				}
			}

			setLastMode(selectedMode)
		}
	}

	return (
		<div
			className={classNames(css.buttonContainer, css.enablePointer)}
			onMouseDown={(ev) => {
				if (ev.button !== 0) return
				setSelectedMode(mode)
			}}
			ref={buttonRef}
		>
			<div
				className={classNames(css.backgroundContainer, css.show)}
				ref={backgroundRef}
			>
				<img
					src={`images/backgrounds/${backgroundImage}.png`}
					className={css.backgroundImage}
				></img>
				<div className={css.vingette}></div>
				<div className={css.leftOverlay}>
					<div className={classNames(css.button)}>
						<div
							className={css.returnButton}
							ref={returnButtonRef}
							onClick={(ev) => {
								if (ev.button !== 0) return
								if (onReturn) onReturn()
								setSelectedMode(null)
							}}
						>
							<img src="../images/back_arrow.svg" alt="back-arrow" />
							<p>Back</p>
						</div>
						<img
							src={`images/hermits-nobg/${image}.png`}
							className={css.hermitImage}
						></img>
						<div className={css.spacer}></div>
						<div className={css.text}>
							<h1>{title}</h1>
							<p>{description}</p>
						</div>
					</div>
				</div>
				<div ref={rightOverlayRef} className={css.rightOverlay}>
					{children}
				</div>
			</div>
		</div>
	)
}

export default HermitButton
