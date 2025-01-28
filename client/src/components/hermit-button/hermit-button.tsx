import classNames from 'classnames'
import React, {
	ReactElement,
	useEffect,
	useReducer,
	useRef,
	useState,
} from 'react'
import css from './button.module.scss'
import Button from 'components/button'
import {Deck} from 'common/types/deck'

interface HermitbuttonProps {
	image: string
	title: string
	type: string
	selectedKey: string | null
	setSelectedKey: (key: string | null) => void
	backgroundImage: string
	selectedDeck: Deck | undefined
	description: string
	children: ReactElement
}

const HermitButton = ({
	image,
	title,
	description,
	type,
	selectedKey,
	setSelectedKey,
	backgroundImage,
	children,
	selectedDeck,
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
		if (!background || !rightOverlay || !returnButton || !button) return
		setSelectedKey(type)
		button.style.zIndex = '1000'
		background.classList.remove(css.hover)
		background.style.width = '60%'
		background.style.transition = 'width 0.6s, left 0.6s'
		background.style.left = '20%'
		rightOverlay.style.transition = 'opacity 1s'
		rightOverlay.style.opacity = '100%'
		returnButton.style.transition = 'opacity 1s'
		returnButton.style.opacity = '100%'
	}

	if (selectedKey && selectedKey !== type) {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (!background || !button) return
		button.style.zIndex = '100'
		background.style.transition = 'transform 0.3s, opacity 0.3s'
		background.style.transform = 'scale(0%)'
		background.style.opacity = '0%'
		button.style.pointerEvents = 'none'
	}

	if (selectedKey === null && buttonPosition) {
		if (!buttonPosition) return
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
		background.style.transform = 'scale(100%)'
		background.style.opacity = '100%'
		background.style.left = `${buttonPosition.x}px`
		background.style.top = `${buttonPosition.y}px`
		background.style.width = `${buttonPosition.w}px`
		background.style.transition =
			'transform 0.6s, opacity 0.6s, width 0.6s, left 0.6s'
		rightOverlay.style.transition = 'opacity 0.2s'
		returnButton.style.transition = 'opacity 0.2s'
		rightOverlay.style.opacity = '0%'
		returnButton.style.opacity = '0%'
		background.classList.add(css.hover)
		button.style.pointerEvents = 'all'
	}

	return (
		<div className={css.buttonContainer} onMouseDown={getBig} ref={buttonRef}>
			<div
				className={classNames(css.backgroundContainer, css.hover)}
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
							onClick={() => {
								setSelectedKey(null)
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
						{selectedDeck && (
							<div className={css.selectedDeck}>
								Selected - {selectedDeck.name}
							</div>
						)}
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
