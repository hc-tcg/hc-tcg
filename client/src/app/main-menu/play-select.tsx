import classNames from 'classnames'
import BerryBush from 'common/cards/advent-of-tcg/attach/berry-bush'
import Dropper from 'common/cards/advent-of-tcg/single-use/dropper'
import Glowstone from 'common/cards/advent-of-tcg/single-use/glowstone'
import {getCardTypeIcon} from 'common/cards/card'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import RenbobRare from 'common/cards/hermits/renbob-rare'
import Anvil from 'common/cards/single-use/anvil'
import Bow from 'common/cards/single-use/bow'
import Egg from 'common/cards/single-use/egg'
import Knockback from 'common/cards/single-use/knockback'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import Lead from 'common/cards/single-use/lead'
import Looting from 'common/cards/single-use/looting'
import PotionOfSlowness from 'common/cards/single-use/potion-of-slowness'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import Spyglass from 'common/cards/single-use/spyglass'
import TargetBlock from 'common/cards/single-use/target-block'
import {Card} from 'common/cards/types'
import {EXPANSIONS} from 'common/const/expansions'
import {CardEntity} from 'common/entities'
import {Deck, Tag} from 'common/types/deck'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import {getIconPath} from 'common/utils/state-gen'
import {validateDeck} from 'common/utils/validation'
import Accordion from 'components/accordion'
import Button from 'components/button'
import CardList from 'components/card-list'
import HermitButton from 'components/hermit-button'
import MenuLayout from 'components/menu-layout'
import {Modal} from 'components/modal'
import Spinner from 'components/spinner'
import {CopyIcon} from 'components/svgs'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {
	getGameCode,
	getSpectatorCode,
	getStatus,
} from 'logic/matchmaking/matchmaking-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {setActiveDeck} from 'logic/saved-decks/saved-decks'
import {getSession} from 'logic/session/session-selectors'
import {useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import css from './play-select.module.scss'
import {CosmeticPreview} from './cosmetics'

type Props = {
	setMenuSection: (section: string) => void
}

function PlaySelect({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const status = useSelector(getStatus)
	const gameCode = useSelector(getGameCode)
	const spectatorCode = useSelector(getSpectatorCode)

	const {playerDeck, playerName, newPlayer} = useSelector(getSession)
	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const [loadedDeck, setLoadedDeck] = useState<Deck | undefined>(
		databaseInfo?.decks.find((deck) => deck.code === playerDeck),
	)

	const decks = databaseInfo?.decks
	const welcomeMessage = newPlayer ? 'Welcome' : 'Welcome Back'
	const [mode, setMode] = useState<string | null>(null)
	const selectedDeckRef = useRef<HTMLDivElement>(null)
	const [lobbyCreated, setLobbyCreated] = useState<boolean>(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const checkForValidation = (): boolean => {
		if (!playerDeck || !loadedDeck) {
			dispatch({
				type: localMessages.TOAST_OPEN,
				open: true,
				title: 'You currently have no active deck selected!',
				description: 'Go to the deck builder to select an active deck.',
				image: '/images/types/type-any.png',
			})
			return false
		}
		const validation = validateDeck(loadedDeck.cards.map((card) => card.props))
		if (validation.valid) return true
		dispatch({
			type: localMessages.TOAST_OPEN,
			open: true,
			title: 'Your deck is not valid!',
			description: `The deck "${loadedDeck.name}" does not meet validation requirements.`,
			image: `/images/types/type-${loadedDeck.icon}.png`,
		})
		return false
	}

	const handleJoinQueue = () => {
		const valid = checkForValidation()
		if (!valid) return
		dispatch({type: localMessages.MATCHMAKING_QUEUE_JOIN})
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
	}
	const handlePrivateGame = () => {
		const valid = checkForValidation()
		if (!valid) return
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_LOBBY})
	}

	const handleCodeSubmit = (code: string) => {
		if (code.length !== 6) {
			dispatch({
				type: localMessages.TOAST_OPEN,
				open: true,
				title: 'Invalid Code!',
				description: 'The code you entered is invalid.',
				image: '/images/types/type-any.png',
			})
			return
		}
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_LOBBY})
		dispatch({type: localMessages.MATCHMAKING_CODE_SET, code})
	}

	const handleCodeClick = () => {
		if (!gameCode) return
		navigator.clipboard.writeText(gameCode)
	}

	const handleSpectatorCodeClick = () => {
		if (!spectatorCode) return
		navigator.clipboard.writeText(spectatorCode)
	}

	const queuingReason = (): string => {
		if (status === 'in_game') return 'Starting game'
		if (status === 'loading') return 'Loading'
		if (status === 'private_lobby') return 'Loading'
		if (status === 'random_waiting') return 'Waiting for opponent'
		if (status === 'waiting_for_player') return 'Waiting for second player'
		if (status === 'waiting_for_player_as_spectator')
			return 'Waiting for game to begin'
		return 'Loading'
	}

	const handleLeaveQueue = () => {
		setTimeout(() => dispatch({type: localMessages.MATCHMAKING_LEAVE}), 200)
	}

	const playSwitchDeckSFX = () => {
		const pageTurn = [
			'/sfx/Page_turn1.ogg',
			'/sfx/Page_turn2.ogg',
			'/sfx/Page_turn3.ogg',
		]
		dispatch({
			type: localMessages.SOUND_PLAY,
			path: pageTurn[Math.floor(Math.random() * pageTurn.length)],
		})
	}

	const decksHaveTags =
		decks.reduce((tags: Array<Tag>, decks) => {
			return [...tags, ...decks.tags]
		}, []).length > 0

	const decksList = decks.map((deck, i) => {
		return (
			<div
				className={classNames(
					css.myDecksItem,
					loadedDeck && deck.code === loadedDeck.code && css.selectedDeck,
				)}
				ref={
					loadedDeck && deck.code === loadedDeck.code
						? selectedDeckRef
						: undefined
				}
				key={i}
				onClick={() => {
					setLoadedDeck(deck)
					setActiveDeck(deck)
					playSwitchDeckSFX()
					dispatch({type: localMessages.UPDATE_DECK, deck: deck})
				}}
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
		)
	})

	/* Boss game stuff */
	const [evilXOpen, setEvilXOpen] = useState<boolean>(false)

	function createUICardInstance(card: Card): LocalCardInstance {
		return {
			props: WithoutFunctions(card),
			entity: card.id as CardEntity,
			slot: null,
			turnedOver: false,
			prizeCard: false,
			attackHint: null,
		} as const
	}

	function removeDisabledExpansions(card: Card) {
		return !EXPANSIONS[card.expansion].disabled
	}

	const handleCreateBossGame = () => {
		const valid = checkForValidation()
		if (!valid) return
		setMenuSection('game-landing')
		dispatch({type: localMessages.MATCHMAKING_BOSS_GAME_CREATE})
	}

	const nonFunctionalCards = [
		Knockback,
		Lead,
		Looting,
		Spyglass,
		Bow,
		SplashPotionOfPoison,
		LavaBucket,

		Egg,
		PotionOfSlowness,
		TargetBlock,

		Dropper,
		Glowstone,
		BerryBush,
	]
		.filter(removeDisabledExpansions)
		.map(createUICardInstance)

	/* Keys */
	const directlyOppositeCards = [Anvil, RenbobRare, PoePoeSkizzRare]
		.filter(removeDisabledExpansions)
		.map(createUICardInstance)

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress)
		return () => {
			window.removeEventListener('keydown', handleKeyPress)
		}
	}, [handleKeyPress])

	function handleKeyPress(e: any) {
		if (e.key === 'Escape') {
			if (mode === null) {
				setMenuSection('main-menu')
				return
			}
			if (status) handleLeaveQueue()
			setMode(null)
		}
	}

	let header = 'Select a game type:'
	switch (mode) {
		case 'public':
			header = 'Public Game'
			break
		case 'private':
			header = 'Private Game'
			break
		case 'boss':
			header = 'Boss Battle'
			break
		case 'tutorial':
			header = 'Tutorial'
			break
		default:
			break
	}

	return (
		<>
			<Modal
				setOpen={evilXOpen}
				title="Rules"
				onClose={() => setEvilXOpen(!evilXOpen)}
			>
				<Modal.Description className={css.bossRules}>
					<p>
						That's right, the Hermitcraft TCG has its first boss fight! This is
						no challenge deck, Evil X cares not for the cards. He brings his own
						moves, and they are vicious! If you think you can defeat him, you'll
						need to bring your best game. Be sure to check your audio settings
						to hear the voice commands during the battle.
					</p>
					<h1>Rules</h1>
					<p>
						You will always go first but can only have three rows to play on.
					</p>
					<p>
						EX has only one row to play on and has no item slots to attach to
						his boss card. However, his card has 300hp, comes back again at full
						health when knocked out, and will perform harder attacks with every
						life lost.
					</p>
					{directlyOppositeCards.length
						? [
								<p>
									EX is always directly opposite your active Hermit for the
									purposes of:
								</p>,
								<div>
									<CardList
										tooltipAboveModal={true}
										cards={directlyOppositeCards}
										wrap={true}
										displayTokenCost={false}
									/>
								</div>,
							]
						: undefined}
					<p>
						EX is immune to and cannot be inflicted with Fire, Poison, and
						Slowness.
					</p>
					<p>The following cards don't work in this battle:</p>
					<div>
						<CardList
							tooltipAboveModal={true}
							cards={nonFunctionalCards}
							wrap={true}
							displayTokenCost={false}
						/>
					</div>
					<h1>EX's Moves & Special</h1>
					<p>Evil X can attack for 50, 70 or 90 damage.</p>
					<p>
						After losing a life, EX can also either heal for 150hp, set your
						active Hermit on fire, or double the damage of his main attack.
					</p>
					<p>
						On his last life, EX can deal 20 damage to all AFK Hermits, discard
						your active Hermit's attached effect card, or force you to discard
						an item card from your active Hermit. Discarded effect cards act as
						if <u>Curse of Vanishing</u> was used and do not trigger from his
						attack.
					</p>
					<p>
						If a special move disables EX's attack, this only prevents attack
						damage, being set on fire and damage against AFK Hermits.
					</p>
					<p>
						At the end of EX's ninth turn, even if he cannot attack, he will
						perform one of two special moves:
					</p>
					<ol>
						<li>Discard your whole hand and draw one new card.</li>
						<li>
							Remove all attached item and effect cards from your active Hermit.
						</li>
					</ol>
				</Modal.Description>
			</Modal>
			<MenuLayout
				back={() => {
					if (status) handleLeaveQueue()
					setMenuSection('main-menu')
				}}
				title="Play"
				returnText="Main Menu"
				className={css.playSelect}
			>
				<div className={css.playerInfo}>
					<p id={css.infoName}>
						{welcomeMessage}, {playerName}
					</p>
					<p id={css.infoDeck}>
						{'Active Deck - ' + `${loadedDeck ? loadedDeck.name : 'None'}`}
					</p>
					<img
						id={css.infoIcon}
						src={loadedDeck ? getIconPath(loadedDeck) : getCardTypeIcon('any')}
						alt="deck-icon"
					/>
				</div>
				<h2 className={css.header}>{header}</h2>
				<div className={css.gameTypes}>
					<div className={css.gameTypesButtons}>
						<HermitButton
							image={'vintagebeef'}
							backgroundImage={'gamemodes/public'}
							title={'Public Game'}
							description={
								'Challenge a random player to a game of HC-TCG Online!'
							}
							mode="public"
							selectedMode={mode}
							setSelectedMode={setMode}
							onReturn={handleLeaveQueue}
						>
							<div className={css.buttonMenu}>
								{!status ? (
									<div className={css.publicConfirm}>
										<p>
											Confirm your deck before entering a game. If you don't
											pick one here, your last selected deck will be used.
										</p>
										<div className={css.deckSelector}>
											<Accordion header={'Deck Select'} defaultOpen={false}>
												<div className={css.decksContainer}>{decksList}</div>
											</Accordion>
										</div>
										<div className={css.spacer}></div>
										<Button
											className={css.publicJoinButton}
											onClick={() => handleJoinQueue()}
											variant="primary"
										>
											Join Queue
										</Button>
									</div>
								) : (
									<div className={css.queueMenu}>
										<div>
											<div className={css.spinner}>
												<Spinner />
											</div>
											<p>{queuingReason()}</p>
											<p>
												Having trouble finding a match? Feel free to join our
												discord!
											</p>
										</div>
									</div>
								)}
							</div>
						</HermitButton>
						<HermitButton
							image={'cubfan135'}
							backgroundImage={'gamemodes/private'}
							title={'Private Game'}
							description={'Play against your friends in a private lobby.'}
							mode="private"
							selectedMode={mode}
							setSelectedMode={setMode}
							onReturn={() => {
								handleLeaveQueue()
								setTimeout(() => setLobbyCreated(false), 200)
							}}
						>
							<div className={css.buttonMenu}>
								{!lobbyCreated && !status && (
									<div className={css.publicConfirm}>
										<p>
											Confirm your deck before entering a game. If you don't
											pick one here, your last selected deck will be used.
										</p>
										<div className={css.deckSelector}>
											<Accordion header={'Deck Select'} defaultOpen={false}>
												<div className={css.decksContainer}>{decksList}</div>
											</Accordion>
										</div>
										<div className={css.spacer}></div>
										<p>
											Enter an opponent code given to you by the player you're
											facing, enter a spectator game to view a match, or create
											your own private lobby.
										</p>
										<div className={css.privateGameCodeArea}>
											<input ref={inputRef} placeholder={'Enter code'}></input>
											<Button
												onClick={() => {
													if (inputRef.current)
														handleCodeSubmit(inputRef.current.value)
												}}
												variant="primary"
											>
												Enter Game
											</Button>
										</div>
										<Button
											className={css.publicJoinButton}
											onClick={() => {
												setLobbyCreated(true)
												handlePrivateGame()
											}}
											variant="primary"
										>
											Create Lobby
										</Button>
									</div>
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
								{status && (
									<div className={css.queueMenu}>
										<div>
											<div className={css.spinner}>
												<Spinner />
											</div>
											<p>{queuingReason()}</p>
										</div>
									</div>
								)}
							</div>
						</HermitButton>
						<HermitButton
							image={'evilxisuma'}
							backgroundImage={'gamemodes/boss'}
							title={'Boss Battle'}
							description={
								'Prove your worth as an HC-TCG player by challenging Evil X to a fight.'
							}
							mode="boss"
							selectedMode={mode}
							setSelectedMode={setMode}
						>
							<div className={css.buttonMenu}>
								<div className={css.publicConfirm}>
									<p>
										Confirm your deck before entering a game. If you don't pick
										one here, your last selected deck will be used.
									</p>
									<div className={css.deckSelector}>
										<Accordion header={'Deck Select'} defaultOpen={false}>
											<div className={css.decksContainer}>{decksList}</div>
										</Accordion>
									</div>
									<div className={css.spacer}></div>
									<Button
										className={css.publicJoinButton}
										onClick={() => setEvilXOpen(true)}
									>
										Show Rules
									</Button>
									<Button
										className={css.publicJoinButton}
										variant={'primary'}
										onClick={handleCreateBossGame}
									>
										Fight Evil X
									</Button>
								</div>
							</div>
						</HermitButton>
					</div>
				</div>
				<div className={css.bottomArea}>
					<div>
						<h3 className={css.appearanceHeader}>In-game Appearance</h3>
						<p className={css.clickToChange}>
							<i>Click to change</i>
						</p>
						<div
							className={css.appearance}
							onClick={() => setMenuSection('cosmetics')}
						>
							<CosmeticPreview />
						</div>
					</div>
				</div>
			</MenuLayout>
		</>
	)
}

export default PlaySelect
