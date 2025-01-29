import classNames from 'classnames'
import {Deck} from 'common/types/deck'
import {ReactElement, useEffect, useReducer, useRef, useState} from 'react'
import css from './button.module.scss'
import {getIconPath} from 'common/utils/state-gen'
import {getCardTypeIcon} from 'common/cards/card'
import {ScreenshotDeckModal} from 'components/import-export'
import {sortCards} from 'common/utils/cards'

interface HermitbuttonProps {
	image: string
	title: string
	mode: string
	selectedMode: string | null
	setSelectedMode: (key: string | null) => void
	backgroundImage: string
	selectedDeck: Deck | undefined
	description: string
	children: ReactElement
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
	selectedDeck,
}: HermitbuttonProps) => {
	const buttonRef = useRef<HTMLDivElement>(null)
	const backgroundRef = useRef<HTMLDivElement>(null)
	const rightOverlayRef = useRef<HTMLDivElement>(null)
	const returnButtonRef = useRef<HTMLDivElement>(null)
	const viewDeckRef = useRef<HTMLButtonElement>(null)

	const [buttonPosition, setButtonPosition] = useState<{
		x: number
		y: number
		h: number
		w: number
	} | null>(null)
	const [, reload] = useReducer((x) => x + 1, 0)
	const [showDeck, setShowDeck] = useState<boolean>(false)

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
		const viewDeck = viewDeckRef.current
		if (
			!background ||
			!rightOverlay ||
			!returnButton ||
			!button ||
			!viewDeck ||
			!buttonPosition
		)
			return
		button.style.zIndex = '90'
		background.classList.remove(css.hover)
		// Resets
		background.style.left = `${buttonPosition.x}px`
		background.style.top = `${buttonPosition.y}px`
		background.style.width = `${buttonPosition.w}px`
		background.style.transform = 'scale(100%)'
		background.style.opacity = '100%'
		button.style.pointerEvents = 'all'

		background.style.width = '60%'
		background.style.transition = 'width 0.3s, left 0.3s'
		background.style.left = '20%'
		rightOverlay.style.transition = 'opacity 0.5s'
		rightOverlay.style.opacity = '100%'
		returnButton.style.transition = 'opacity 0.5s'
		returnButton.style.opacity = '100%'
		viewDeck.style.transition = 'opacity 0.5s'
		viewDeck.style.opacity = '100%'
		background.style.pointerEvents = 'all'
	}

	if (selectedMode === mode) getBig()

	if (selectedMode && selectedMode !== mode) {
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
		button.style.pointerEvents = 'none'
		background.style.pointerEvents = 'none'
	}

	if (selectedMode === null && buttonPosition) {
		if (!buttonPosition) return
		const background = backgroundRef.current
		const rightOverlay = rightOverlayRef.current
		const returnButton = returnButtonRef.current
		const button = buttonRef.current
		const viewDeck = viewDeckRef.current
		if (
			!background ||
			!rightOverlay ||
			!returnButton ||
			!buttonPosition ||
			!button ||
			!viewDeck
		)
			return
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
		viewDeck.style.transition = 'opacity 0.1s'
		viewDeck.style.opacity = '0%'
		background.classList.add(css.hover)
		button.style.pointerEvents = 'all'
		background.style.pointerEvents = 'none'
	}

	return (
		<>
			<div
				className={css.buttonContainer}
				onMouseDown={() => setSelectedMode(mode)}
				ref={buttonRef}
			>
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
								onClick={() => setSelectedMode(null)}
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
								<>
									<div className={css.selectedDeck}>
										Selected - {selectedDeck.name}
										<img
											className={css.infoIcon}
											src={
												selectedDeck
													? getIconPath(selectedDeck)
													: getCardTypeIcon('any')
											}
											alt="deck-icon"
										/>
									</div>
									<button
										className={css.viewDeckButton}
										onClick={() => setShowDeck(true)}
										ref={viewDeckRef}
									>
										<img src="/images/toolbar/shulker.png" />
									</button>
								</>
							)}
						</div>
					</div>
					<div ref={rightOverlayRef} className={css.rightOverlay}>
						{children}
					</div>
				</div>
			</div>
			<ScreenshotDeckModal
				setOpen={showDeck}
				onClose={() => setShowDeck(false)}
				cards={
					selectedDeck
						? sortCards(selectedDeck.cards.map((card) => card.props))
						: []
				}
			></ScreenshotDeckModal>
		</>
	)
}

export default HermitButton
