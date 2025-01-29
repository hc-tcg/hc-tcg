import classNames from 'classnames'
import {ReactElement, useEffect, useReducer, useRef, useState} from 'react'
import css from './button.module.scss'

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

	const [buttonPosition, setButtonPosition] = useState<{
		x: number
		y: number
		h: number
		w: number
	} | null>(null)
	const [, reload] = useReducer((x) => x + 1, 0)

	useEffect(() => {
		if (!buttonPosition) {
			if (!buttonRef.current || !backgroundRef.current) {
				reload()
			} else {
				const pos = buttonRef.current.getBoundingClientRect()
				setButtonPosition({x: pos.x, y: pos.y, h: pos.height, w: pos.width})
				backgroundRef.current.style.left = `${pos.x}px`
			}
		}
	})

	const getBig = () => {
		if (!buttonPosition) return
		const background = backgroundRef.current
		const rightOverlay = rightOverlayRef.current
		const returnButton = returnButtonRef.current
		const button = buttonRef.current
		if (
			!background ||
			!rightOverlay ||
			!returnButton ||
			!button ||
			!buttonPosition
		)
			return
		button.style.zIndex = '90'
		button.classList.remove(css.clickable)
		// Resets
		background.style.left = `${buttonPosition.x}px`
		background.style.top = `${buttonPosition.y}px`
		background.style.width = `${buttonPosition.w}px`
		background.style.transform = 'scale(100%)'
		background.style.opacity = '100%'

		background.style.width = '60%'
		background.style.transition = 'width 0.3s, left 0.3s'
		background.style.left = '20%'
		rightOverlay.style.transition = 'opacity 0.5s'
		rightOverlay.style.opacity = '100%'
		returnButton.style.transition = 'opacity 0.5s'
		returnButton.style.opacity = '100%'
		background.style.pointerEvents = 'all'
	}

	const shrink = () => {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (!background || !button || !buttonPosition) return
		background.style.left = `${buttonPosition.x}px`
		background.style.top = `${buttonPosition.y}px`
		background.style.width = `${buttonPosition.w}px`
		button.style.zIndex = '80'
		background.style.transition = 'transform 0.15s, opacity 0.15s'
		background.style.transform = 'scale(0%)'
		background.style.opacity = '0%'
		background.style.pointerEvents = 'none'
		button.style.pointerEvents = 'none'
	}

	const reset = () => {
		const background = backgroundRef.current
		const rightOverlay = rightOverlayRef.current
		const returnButton = returnButtonRef.current
		const button = buttonRef.current
		if (
			!background ||
			!rightOverlay ||
			!returnButton ||
			!buttonPosition ||
			!button
		)
			return
		button.classList.add(css.clickable)
		background.style.transform = 'scale(100%)'
		background.style.opacity = '100%'
		background.style.left = `${buttonPosition.x}px`
		background.style.top = `${buttonPosition.y}px`
		background.style.width = `${buttonPosition.w}px`
		background.style.transition =
			'transform 0.3s, opacity 0.3s, width 0.3s, left 0.3s'
		rightOverlay.style.transition = 'opacity 0.1s'
		rightOverlay.style.opacity = '0%'
		returnButton.style.transition = 'opacity 0.1s'
		returnButton.style.opacity = '0%'
		button.style.pointerEvents = 'all'
		background.style.pointerEvents = 'none'
	}

	if (selectedMode === mode) getBig()
	else if (selectedMode && selectedMode !== mode) shrink()
	else if (selectedMode === null && buttonPosition) reset()

	return (
		<div
			className={classNames(css.buttonContainer, css.clickable)}
			onMouseDown={() => setSelectedMode(mode)}
			ref={buttonRef}
		>
			<div className={css.backgroundContainer} ref={backgroundRef}>
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
							onClick={() => {
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
