import classNames from 'classnames'
import {ReactElement, useEffect, useReducer, useRef, useState} from 'react'
import css from './game-mode-button.module.scss'
import Button from 'components/button'
import {Deck, Tag} from 'common/types/deck'
import {getIconPath} from 'common/utils/state-gen'
import {useSelector} from 'react-redux'
import {getSession} from 'logic/session/session-selectors'
import Spinner from 'components/spinner'

interface GameModeButtonProps {
	image: string
	title: string
	mode: string
	selectedMode: string | null
	setSelectedMode: (key: string | null) => void
	backgroundImage: string
	description: string
	children: ReactElement | ReactElement[]
	onSelect?: () => void
	onReturn?: () => void
	disableBack: boolean
}

function GameModeButton({
	image,
	title,
	description,
	mode,
	selectedMode,
	setSelectedMode,
	backgroundImage,
	children,
	onSelect,
	onReturn,
	disableBack,
}: GameModeButtonProps) {
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
				backgroundRef.current.style.translate = 'calc((100vw - 70vh) / 2) 0'
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

		background.style.translate = 'calc((100vw - 70vh) / 2) 0'
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
				if (mode !== selectedMode && onSelect) onSelect()
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
						{!disableBack && (
							<div
								className={css.returnButton}
								ref={returnButtonRef}
								onClick={(ev) => {
									if (disableBack) return
									if (ev.button !== 0) return
									if (onReturn) onReturn()
									setSelectedMode(null)
								}}
							>
								<img src="../images/back_arrow.svg" alt="back-arrow" />
								<p>Back</p>
							</div>
						)}
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
					{selectedMode === mode && children}
				</div>
			</div>
		</div>
	)
}

interface ChooseDeckProps {
	active: boolean
	title: string
	subTitle: string
	confirmMessage: string
	onConfirm: () => void
	onSelectDeck: (deck: Deck) => void
	decks: Deck[]
}

GameModeButton.ChooseDeck = ({
	active,
	title,
	subTitle,
	confirmMessage,
	onConfirm,
	onSelectDeck,
	decks,
}: ChooseDeckProps) => {
	// Don't do any logic if we are not active
	if (!active) return <></>

	// @TODO needs to find the active deck in a better way
	// aka this whole system needs to be consistent
	const {playerDeck} = useSelector(getSession)

	const decksHaveTags =
		decks.reduce((tags: Array<Tag>, decks) => {
			return [...tags, ...decks.tags]
		}, []).length > 0

	const deckSelector = (
		<div className={css.deckSelector}>
			{decks.map((deck, i) => (
				<div
					className={classNames(
						css.myDecksItem,
						playerDeck && deck.code === playerDeck && css.selectedDeck,
					)}
					key={i}
					onClick={() => onSelectDeck(deck)}
				>
					{deck.tags && deck.tags.length > 0 && (
						<div className={css.multiColoredCircle}>
							{deck.tags.map((tag, i) => (
								<div
									className={css.singleTag}
									style={{backgroundColor: tag.color}}
									key={i}
								></div>
							))}
						</div>
					)}
					{decksHaveTags && deck.tags.length === 0 && (
						<div className={css.multiColoredCircle}>
							<div className={css.singleTag}></div>
						</div>
					)}
					<div
						className={classNames(css.deckImage, css.usesIcon, css[deck.icon])}
					>
						<img src={getIconPath(deck)} alt={'deck-icon'} />
					</div>
					<div className={css.deckName}>{deck.name}</div>
				</div>
			))}
		</div>
	)
	return (
		<div className={css.buttonMenu}>
			<div className={css.chooseDeck}>
				<h3>{title}</h3>
				<p>{subTitle}</p>
				{deckSelector}
				<Button
					className={css.largeButton}
					onClick={onConfirm}
					variant="primary"
				>
					{confirmMessage}
				</Button>
			</div>
		</div>
	)
}

interface QueueProps {
	active: boolean
	title: string
	message: string
	extraMessage?: string
	onCancel: () => void
	// @TODO active deck
}

GameModeButton.Queue = ({
	active,
	title,
	message,
	extraMessage,
	onCancel,
}: QueueProps) => {
	// Don't do any logic if we are not active
	if (!active) return <></>

	return (
		<div className={css.buttonMenu}>
			<div className={css.queue}>
				<h3>{title}</h3>
				<div className={css.spacer} />
				<div className={css.spinner}>
					<Spinner />
				</div>
				<p>{message}</p>
				{extraMessage && <p>{extraMessage}</p>}
				<div className={css.spacer} />
				<Button className={css.largeButton} onClick={onCancel} variant="error">
					Cancel
				</Button>
			</div>
		</div>
	)
}

/*
				<h3>Choose your deck</h3>
				<p>When ready, press the Join Queue button to begin.</p>
				() => {
						selectDeck(deck)
						playSwitchDeckSFX()
						dispatch({type: localMessages.UPDATE_DECK, deck: deck})
					}
				


								{queueStatus && (
								)}
				*/

export default GameModeButton
