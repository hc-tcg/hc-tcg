import classNames from 'classnames'
import {ReactElement, useEffect, useReducer, useRef, useState} from 'react'
import css from './game-mode-button.module.scss'
import Button from 'components/button'
import {Deck, Tag} from 'common/types/deck'
import {getIconPath} from 'common/utils/state-gen'
import {useSelector} from 'react-redux'
import {getSession} from 'logic/session/session-selectors'
import Spinner from 'components/spinner'
import {ButtonVariant} from 'common/types/buttons'
import {MatchmakingStatus} from 'logic/matchmaking/matchmaking-types'
import {CopyIcon} from 'components/svgs'

interface GameModeButtonProps {
	image: string
	title: string
	mode: string
	activeMode: string | null
	setActiveMode: (key: string | null) => void
	backgroundImage: string
	description: string
	children: ReactElement | ReactElement[]
	onSelect: () => void
	onBack: () => void
	disableBack: boolean
}

function GameModeButton({
	image,
	title,
	description,
	mode,
	activeMode,
	setActiveMode,
	backgroundImage,
	children,
	onSelect,
	onBack,
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

			if (activeMode === mode) {
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

	if (activeMode != lastMode) {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (buttonPosition && background && button) {
			if (activeMode === mode) {
				// Only trigger a change when the selected mode changed
				grow()
			} else if (activeMode && activeMode !== mode) {
				hide()
			} else if (activeMode === null) {
				if (lastMode == mode) {
					shrink()
				} else {
					show()
				}
			}

			setLastMode(activeMode)
		}
	}

	return (
		<div
			className={classNames(css.buttonContainer, css.enablePointer)}
			onMouseDown={(ev) => {
				if (ev.button !== 0) return
				setActiveMode(mode)
				if (mode !== activeMode && onSelect) onSelect()
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
							className={classNames(
								css.returnButton,
								disableBack && css.disableBack,
							)}
							ref={returnButtonRef}
							onClick={(ev) => {
								if (disableBack) return
								if (ev.button !== 0) return
								if (onBack) onBack()
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
					{activeMode === mode && children}
				</div>
			</div>
		</div>
	)
}

interface ButtonMenuProps {
	activeButtonMenu: string | null
	id: string
}

interface ChooseDeckProps extends ButtonMenuProps {
	title: string
	subTitle: string
	requestCode?: boolean
	confirmMessage: string
	onConfirm: (code?: string) => void
	onSelectDeck: (deck: Deck) => void
	decks: Deck[]
}

GameModeButton.ChooseDeck = ({
	activeButtonMenu,
	id,
	title,
	subTitle,
	requestCode = false,
	confirmMessage,
	onConfirm,
	onSelectDeck,
	decks,
}: ChooseDeckProps) => {
	if (activeButtonMenu !== id) return <></>

	const {playerDeck} = useSelector(getSession)
	const inputRef = useRef<HTMLInputElement>(null)

	const decksHaveTags =
		decks.reduce((tags: Array<Tag>, decks) => {
			return [...tags, ...decks.tags]
		}, []).length > 0

	const deckSelector = (
		<div className={css.deckSelector}>
			{decks.map((deck, i) => (
				<div
					className={classNames(
						css.deck,
						playerDeck && deck.code === playerDeck && css.selectedDeck,
					)}
					key={i}
					onClick={() => onSelectDeck(deck)}
				>
					{deck.tags && deck.tags.length > 0 && (
						<div className={css.multiColoredCircle}>
							{deck.tags.map((tag, i2) => (
								<div
									className={css.singleTag}
									style={{backgroundColor: tag.color}}
									key={i2}
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
						<img src={getIconPath(deck)} />
					</div>
					<div className={css.deckName}>{deck.name}</div>
				</div>
			))}
		</div>
	)

	const confirmButton = (
		<Button
			className={css.largeButton}
			onClick={() => {
				onConfirm(inputRef.current?.value ?? undefined)
			}}
			variant="primary"
		>
			{confirmMessage}
		</Button>
	)

	return (
		<div className={css.buttonMenu}>
			<div className={css.chooseDeck}>
				<h3>{title}</h3>
				<p>{subTitle}</p>
				{deckSelector}
				{requestCode ? (
					<div className={css.row}>
						<input
							type="text"
							ref={inputRef}
							className={css.largeButton}
							placeholder="Enter code..."
							spellCheck={false}
						/>
						{confirmButton}
					</div>
				) : (
					confirmButton
				)}
			</div>
		</div>
	)
}
interface EnterCodeProps extends ButtonMenuProps {
	title: string
	subTitle: string
	placeholder: string
	confirmMessage: string
	onConfirm: (code: string) => void
}

GameModeButton.EnterCode = ({
	activeButtonMenu,
	id,
	title,
	subTitle,
	placeholder,
	confirmMessage,
	onConfirm,
}: EnterCodeProps) => {
	if (activeButtonMenu !== id) return <></>

	const inputRef = useRef<HTMLInputElement>(null)

	return (
		<div className={css.buttonMenu}>
			<div className={css.enterCode}>
				<h3>{title}</h3>
				<p>{subTitle}</p>
				<div className={css.spacer}></div>
				<input
					type="text"
					ref={inputRef}
					className={css.largeButton}
					placeholder={placeholder}
					spellCheck={false}
				/>
				<Button
					className={css.largeButton}
					onClick={() => {
						const code = inputRef.current?.value ?? undefined
						if (code) onConfirm(code)
					}}
					variant="primary"
				>
					{confirmMessage}
				</Button>
			</div>
		</div>
	)
}

export type CodeInfo = {
	name: string
	code: string
}

interface QueueProps extends ButtonMenuProps {
	joiningMessage: string
	queueMessage: string
	timedMessage?: ReactElement
	activeDeck?: Deck
	codes?: CodeInfo[]
	onCodeClick?: (code: CodeInfo) => void
	matchmakingStatus: MatchmakingStatus
	cancelMessage: string
	onCancel: () => void
}

GameModeButton.Queue = ({
	activeButtonMenu,
	id,
	joiningMessage,
	queueMessage,
	timedMessage,
	activeDeck,
	codes,
	onCodeClick,
	matchmakingStatus,
	cancelMessage,
	onCancel,
}: QueueProps) => {
	if (activeButtonMenu !== id) return <></>

	useEffect(() => {
		// If we're no longer in the queue for whatever reason, go back after 1 second.
		if (!matchmakingStatus) onCancel()
	})

	const [innerMessage, setInnerMessage] = useState<string>(joiningMessage)

	const gameMessage = 'Starting game...'
	switch (matchmakingStatus) {
		case 'in_game':
			if (innerMessage !== gameMessage) {
				setInnerMessage(gameMessage)
			}
			break
		case 'joining_queue':
			if (innerMessage !== joiningMessage) {
				setInnerMessage(joiningMessage)
			}
			break
		case 'in_queue':
			if (innerMessage !== queueMessage) {
				setInnerMessage(queueMessage)
			}
		default:
			break
	}

	let codesHtml
	if (codes) {
		codesHtml = (
			<div className={css.codes}>
				{codes.map(({name, code}, i) => {
					return (
						<div className={css.code} key={i}>
							<p>{name}:</p>
							<p
								className={css.copy}
								onClick={() => onCodeClick && onCodeClick({name, code})}
							>
								<CopyIcon />
								{code}
							</p>
						</div>
					)
				})}
			</div>
		)
	}

	return (
		<div className={css.buttonMenu}>
			<div className={css.queue}>
				<h3 className={css.message}>{innerMessage}</h3>
				<Spinner />
				{timedMessage && <p className={css.timedMessage}>{timedMessage}</p>}
				{codesHtml}
				{activeDeck && (
					<div className={css.deck}>
						<p>Active deck:</p>
						<div
							className={classNames(
								css.deckImage,
								css.usesIcon,
								css[activeDeck.icon],
							)}
						>
							<img src={getIconPath(activeDeck)} />
						</div>
						<p className={css.deckName}>{activeDeck.name}</p>
					</div>
				)}
				<Button onClick={onCancel} variant="error">
					{cancelMessage}
				</Button>
			</div>
		</div>
	)
}

interface OptionsSelectProps extends ButtonMenuProps {
	title: string
	subTitle?: string
	buttons: Array<{
		text: string
		onClick: () => void
		variant?: ButtonVariant
	}>
}

GameModeButton.OptionsSelect = ({
	activeButtonMenu,
	id,
	title,
	subTitle,
	buttons,
}: OptionsSelectProps) => {
	if (activeButtonMenu !== id) return <></>

	return (
		<div className={css.buttonMenu}>
			<div className={css.optionsSelect}>
				<h3>{title}</h3>
				{subTitle && <p>{subTitle}</p>}
				<div className={css.spacer}></div>
				{buttons.map(({text, onClick, variant}, i) => (
					<Button
						className={css.largeButton}
						onClick={onClick}
						key={i}
						variant={variant ? variant : 'default'}
					>
						{text}
					</Button>
				))}
			</div>
		</div>
	)
}

/*
				
							<div className={css.buttonMenu}>
								{!lobbyCreated && !queueStatus && (
								)}
								{lobbyCreated && (
									<div className={css.queueMenu}>
										<div>
											<p>Opponent Code</p>
											<div className={css.code} onClick={handleCodeClick}>
												<CopyIcon /> {gameCode}
											</div>
											<p>Spectator Code</p>
											<div
												className={css.code}
												onClick={handleSpectatorCodeClick}
											>
												<CopyIcon /> {spectatorCode}
											</div>
										</div>
									</div>
								)}
							</div>
				*/

export default GameModeButton
