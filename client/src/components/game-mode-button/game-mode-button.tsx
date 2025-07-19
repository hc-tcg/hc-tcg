import classNames from 'classnames'
import {CARDS} from 'common/cards'
import {getIconPath} from 'common/game/setup-game'
import {ButtonVariant} from 'common/types/buttons'
import {Deck, Tag} from 'common/types/deck'
import {getDeckTypes} from 'common/utils/decks'
import Button from 'components/button'
import Spinner from 'components/spinner'
import {CopyIcon} from 'components/svgs'
import {MatchmakingStatus} from 'logic/matchmaking/matchmaking-types'
import {getSession} from 'logic/session/session-selectors'
import {
	ReactElement,
	ReactNode,
	useEffect,
	useReducer,
	useRef,
	useState,
} from 'react'
import {useSelector} from 'react-redux'
import {FilterComponent} from '../../app/deck/deck-select'
import css from './game-mode-button.module.scss'

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
	mobileTop: number
	disabled?: boolean
	timerStart?: number
	timerLength?: number
	enableRematch: boolean
	onRematchSelect?: () => void
	onRematchCancel?: () => void
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
	mobileTop,
	disabled,
	timerStart,
	timerLength,
	enableRematch,
	onRematchSelect,
	onRematchCancel,
}: GameModeButtonProps) {
	const buttonRef = useRef<HTMLDivElement>(null)
	const backgroundRef = useRef<HTMLDivElement>(null)
	const rightOverlayRef = useRef<HTMLDivElement>(null)
	const returnButtonRef = useRef<HTMLDivElement>(null)

	const [lastMode, setLastMode] = useState<string | null>(null)
	const [timer, setTimer] = useState(
		timerStart && timerLength
			? Math.max(Math.floor((timerStart - Date.now() + timerLength) / 1000), 0)
			: 0,
	)

	const onMobile = window.innerWidth <= window.innerHeight

	const [buttonPosition, setButtonPosition] = useState<{
		x: number
		y: number
		h: number
		w: number
	} | null>(null)
	const [, reload] = useReducer((x) => x + 1, 0)

	const transform = 'calc((100vw - 85vh) / 2) 0'
	const mobileTransform = `0 ${mobileTop}px`

	const handleResize = () => {
		if (!buttonRef.current || !backgroundRef.current) {
			reload()
		} else {
			const pos = buttonRef.current.getBoundingClientRect()
			const onMobile = window.innerWidth <= window.innerHeight
			setButtonPosition({x: pos.x, y: pos.y, h: pos.height, w: pos.width})

			if (activeMode === mode) {
				backgroundRef.current.style.translate = onMobile
					? mobileTransform
					: transform
			} else if (onMobile) {
				backgroundRef.current.style.translate = `0 ${pos.y}px`
			} else {
				backgroundRef.current.style.translate = `${pos.x}px 0`
			}
		}
	}

	//Handle Timer
	useEffect(() => {
		if (timerLength === undefined && timerStart === undefined) return
		setTimeout(() => {
			if (timer <= 0) return
			setTimer(timer - 1)
		}, 1000)
	})

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

		backgroundRef.current.style.translate = onMobile
			? mobileTransform
			: transform
	}

	const shrink = () => {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (!background || !buttonPosition || !button) return

		button.classList.remove(css.disablePointer)
		button.classList.add(css.enablePointer)

		background.classList.remove(css.grow, css.show, css.hide)
		background.classList.add(css.shrink)

		background.style.translate = onMobile
			? `0 ${buttonPosition.y}px`
			: `${buttonPosition.x}px 0`
	}

	const hide = () => {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (!background || !button || !buttonPosition) return

		button.classList.remove(css.enablePointer)
		button.classList.add(css.disablePointer)

		background.classList.remove(css.shrink, css.grow, css.show)
		background.classList.add(css.hide)

		background.style.translate = onMobile
			? `0 ${buttonPosition.y}px`
			: `${buttonPosition.x}px 0`
	}
	const show = () => {
		const background = backgroundRef.current
		const button = buttonRef.current
		if (!background || !button || !buttonPosition) return

		button.classList.remove(css.disablePointer)
		button.classList.add(css.enablePointer)

		background.classList.remove(css.hide, css.grow, css.shrink)
		background.classList.add(css.show)

		background.style.translate = onMobile
			? `0 ${buttonPosition.y}px`
			: `${buttonPosition.x}px 0`
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
				if (disabled) return
				if (mode !== activeMode) {
					setActiveMode(mode)
					if (onSelect) onSelect()
				}
			}}
			ref={buttonRef}
		>
			<div
				className={classNames(
					css.backgroundContainer,
					css.show,
					disabled && css.disabled,
				)}
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
						<div
							className={classNames(
								css.text,
								enableRematch && activeMode !== mode && css.makeHigherOnMobile,
							)}
						>
							<h1>{title}</h1>
							<p>{description}</p>
						</div>
						{enableRematch && (
							<div
								className={classNames(
									css.text,
									css.rematch,
									activeMode === mode && css.hide,
								)}
								onMouseDown={(ev) => {
									ev.stopPropagation()
									if (ev.button !== 0) return
									if (disabled) return
									if (!onRematchSelect) return
									setActiveMode('rematch')
									onRematchSelect()
								}}
							>
								<div className={css.title}>
									Rematch {!onMobile && 'your last opponent'}
								</div>
								<div className={css.rematchTimeRemaining}>
									{timer}s {!onMobile && 'Remaining'}
								</div>
							</div>
						)}
						{enableRematch && (
							<div
								className={classNames(
									css.text,
									css.rematch,
									css.cancel,
									activeMode === mode && css.hide,
								)}
								onMouseDown={(ev) => {
									ev.stopPropagation()
									if (ev.button !== 0) return
									if (disabled) return
									if (!onRematchCancel) return
									onRematchCancel()
								}}
							>
								<div className={css.title}>Cancel {!onMobile && 'Rematch'}</div>
							</div>
						)}
					</div>
				</div>
				<div
					ref={rightOverlayRef}
					className={classNames(
						css.rightOverlay,
						activeMode !== mode && css.disallowClicks,
					)}
				>
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
	defaultCode?: string
	disableButton?: boolean
}

GameModeButton.ChooseDeck = ({
	activeButtonMenu,
	id,
	title,
	subTitle,
	requestCode = false,
	disableButton = false,
	confirmMessage,
	onConfirm,
	onSelectDeck,
	decks,
	defaultCode,
}: ChooseDeckProps) => {
	if (activeButtonMenu !== id) return <></>

	const {playerDeck} = useSelector(getSession)
	const inputRef = useRef<HTMLInputElement>(null)

	const [filteredDecks, setFilteredDecks] = useState<Array<Deck>>(decks)
	const [tagFilter, setTagFilter] = useState<Tag | null>(null)
	const [typeFilter, setTypeFilter] = useState<string>('')
	const [nameFilter, setNameFilter] = useState<string>('')

	const decksHaveTags =
		decks.reduce((tags: Array<Tag>, decks) => {
			return [...tags, ...decks.tags]
		}, []).length > 0

	function filterDecks(
		decks: Array<Deck>,
		d?: {tag?: string | null; type?: string; name?: string},
	): Array<Deck> {
		const compareTag = d && d.tag === null ? null : (d && d.tag) || tagFilter
		const compareType = (d && d.type) || typeFilter
		const compareName = d && d.name !== undefined ? d.name : nameFilter

		return decks.filter(
			(deck) =>
				(!compareTag || deck.tags?.find((tag) => tag.key === compareTag)) &&
				(!compareType ||
					compareType === 'any' ||
					getDeckTypes(deck.cards.map((card) => CARDS[card.id].id)).includes(
						compareType,
					)) &&
				(!compareName ||
					compareName === '' ||
					deck.name
						.toLocaleLowerCase()
						.includes(compareName.toLocaleLowerCase())),
		)
	}

	const filteredDecksHtml = filteredDecks.map((deck, i) => (
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
			<div className={classNames(css.deckImage, css.usesIcon, css[deck.icon])}>
				<img src={getIconPath(deck)} />
			</div>
			<div className={css.deckName}>{deck.name}</div>
		</div>
	))

	const deckSelector = (
		<div className={css.deckSelector}>
			{filteredDecksHtml.length ? (
				filteredDecksHtml
			) : (
				<p className={css.noResults}>No decks found.</p>
			)}
		</div>
	)

	const confirmButton = (
		<Button
			className={css.largeButton}
			onClick={() => {
				onConfirm(inputRef.current?.value ?? undefined)
			}}
			variant="primary"
			disabled={disableButton}
		>
			{confirmMessage}
		</Button>
	)

	return (
		<div className={css.buttonMenu}>
			<div className={css.chooseDeck}>
				<h3>{title}</h3>
				<p>{subTitle}</p>
				<div className={css.filter}>
					<FilterComponent
						tagFilter={tagFilter}
						tagFilterAction={(option: string) => {
							const parsedOption = JSON.parse(option) as Tag

							if (option.includes('No Tag')) {
								setFilteredDecks(filterDecks(decks, {tag: null}))
								setTagFilter(null)
							} else {
								setFilteredDecks(filterDecks(decks, {tag: parsedOption.key}))
								setTagFilter(parsedOption)
							}
						}}
						typeFilter={typeFilter}
						typeFilterAction={(option: string) => {
							setFilteredDecks(filterDecks(decks, {type: option}))
							setTypeFilter(option)
						}}
						nameFilterAction={(name: string) => {
							setFilteredDecks(filterDecks(decks, {name}))
							setNameFilter(name)
						}}
						dropdownDirection={'down'}
					></FilterComponent>
				</div>
				{deckSelector}
				{requestCode ? (
					<div className={css.row}>
						<input
							type="text"
							ref={inputRef}
							className={classNames(css.largeButton, css.deckSelectorInput)}
							placeholder="Enter code..."
							spellCheck={false}
							value={defaultCode}
							data-testid="join-code-input"
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
	defaultCode?: string
}

GameModeButton.EnterCode = ({
	activeButtonMenu,
	id,
	title,
	subTitle,
	placeholder,
	confirmMessage,
	onConfirm,
	defaultCode: content,
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
					value={content}
					data-testid="spectate-code-input"
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

interface CustomMenuProps extends ButtonMenuProps {
	children: ReactNode | ReactNode[]
}

GameModeButton.CustomMenu = ({
	activeButtonMenu,
	id,
	children,
}: CustomMenuProps) => {
	if (activeButtonMenu !== id) return <></>

	return <div className={css.buttonMenu}>{children}</div>
}

export default GameModeButton
