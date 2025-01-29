import {validateDeck} from 'common/utils/validation'
import Button from 'components/button'
import HermitButton from 'components/hermit-button'
import MenuLayout from 'components/menu-layout'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {getSession} from 'logic/session/session-selectors'
import {useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import css from './games-landing.module.scss'
import {Deck, Tag} from 'common/types/deck'
import classNames from 'classnames'
import {getIconPath} from 'common/utils/state-gen'
import {setActiveDeck} from 'logic/saved-decks/saved-decks'
import {Modal} from 'components/modal'
import Knockback from 'common/cards/single-use/knockback'
import Lead from 'common/cards/single-use/lead'
import Looting from 'common/cards/single-use/looting'
import Spyglass from 'common/cards/single-use/spyglass'
import Bow from 'common/cards/single-use/bow'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import Egg from 'common/cards/single-use/egg'
import PotionOfSlowness from 'common/cards/single-use/potion-of-slowness'
import TargetBlock from 'common/cards/single-use/target-block'
import Dropper from 'common/cards/advent-of-tcg/single-use/dropper'
import Glowstone from 'common/cards/advent-of-tcg/single-use/glowstone'
import BerryBush from 'common/cards/advent-of-tcg/attach/berry-bush'
import Anvil from 'common/cards/single-use/anvil'
import RenbobRare from 'common/cards/hermits/renbob-rare'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import {Card} from 'common/cards/types'
import {CardEntity} from 'common/entities'
import {EXPANSIONS} from 'common/const/expansions'
import CardList from 'components/card-list'
import Spinner from 'components/spinner'
import {delay} from 'typed-redux-saga'

type Props = {
	setMenuSection: (section: string) => void
}

function GameLanding({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const {playerDeck} = useSelector(getSession)
	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const [loadedDeck, setLoadedDeck] = useState<Deck | undefined>(
		databaseInfo?.decks.find((deck) => deck.code === playerDeck),
	)

	const decks = databaseInfo?.decks
	const [mode, setMode] = useState<string | null>(null)
	const selectedDeckRef = useRef<HTMLDivElement>(null)
	const [queing, setQueing] = useState<boolean>(false)

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

	const handeJoinQueue = () => {
		const valid = checkForValidation()
		if (!valid) return
		setQueing(true)
		dispatch({type: localMessages.MATCHMAKING_QUEUE_JOIN})
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
	}
	const handlePrivateGame = () => {
		const valid = checkForValidation()
		if (!valid) return
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_LOBBY})
	}

	const handleLeaveQueue = () => {
		dispatch({type: localMessages.MATCHMAKING_LEAVE})
		setTimeout(() => setQueing(false), 200)
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

	const tutorialDeck: Deck = {
		name: 'Tutorial Deck',
		iconType: 'hermit',
		icon: 'geminitay',
		cards: [],
		tags: [],
		public: false,
		code: '111111',
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
				{deck.name}
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

	const order = ['public', 'private', 'boss', 'tutorial']
	function handleKeyPress(e: any) {
		if (e.key === 'Escape') {
			if (mode === null) {
				setMenuSection('main-menu')
				return
			}
			if (queing) handleLeaveQueue()
			setMode(null)
		}
		if (e.key == 'Tab') {
			if (!mode) {
				setMode('public')
				return
			}
			const currentModeIndex = order.findIndex((i) => i === mode)
			setMode(order[(currentModeIndex + 1) % order.length])
		}
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
					if (queing) handleLeaveQueue()
					setMenuSection('mainmenu')
				}}
				title="Play"
				returnText="Main Menu"
				className={css.gamesPage}
			>
				<div className={css.gamesLanding}>
					<div>
						<div className={css.gamesLandingButtons}>
							<HermitButton
								image={'vintagebeef'}
								backgroundImage={'gamemodes/public'}
								title={'Public Game'}
								description={'Challenge a random player to a game of HC-TCG!'}
								mode="public"
								selectedMode={mode}
								setSelectedMode={setMode}
								selectedDeck={loadedDeck}
								onReturn={handleLeaveQueue}
							>
								<div className={css.fullLeft}>
									{!queing && (
										<div className={css.buttonMenu}>
											<p>Select a deck to use in this game mode.</p>
											<div className={css.deckSelector}>
												<div className={css.decksContainer}>{decksList}</div>
											</div>
											<Button onClick={() => handeJoinQueue()}>
												Join Queue
											</Button>
										</div>
									)}
									{queing && (
										<div className={css.queueMenu}>
											<div>
												<div className={css.spinner}>
													<Spinner />
												</div>
												<p>Waiting For Opponent</p>
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
								selectedDeck={loadedDeck}
							>
								<div className={css.buttonMenu}>
									<p>Select a deck to use in this game mode.</p>
									<div className={css.deckSelector}>
										<div className={css.decksContainer}>{decksList}</div>
									</div>
									<Button onClick={handlePrivateGame}>Create Lobby</Button>
								</div>
							</HermitButton>
							<HermitButton
								image={'evilxisuma'}
								backgroundImage={'gamemodes/boss'}
								title={'Boss Battle'}
								description={'Challenge Evil X to a fight. Blah Blah Blah Blah'}
								mode="boss"
								selectedMode={mode}
								setSelectedMode={setMode}
								selectedDeck={loadedDeck}
							>
								<div className={css.buttonMenu}>
									<p>Select a deck to use in this game mode.</p>
									<div className={css.deckSelector}>
										<div className={css.decksContainer}>{decksList}</div>
									</div>
									<Button onClick={() => setEvilXOpen(true)}>Show Rules</Button>
									<Button onClick={handleCreateBossGame}>Fight Evil X</Button>
								</div>
							</HermitButton>
							<HermitButton
								image={'geminitay'}
								backgroundImage={'gamemodes/tutorial'}
								title={'Tutorial'}
								description={
									'Play a game against the computer to learn the rules of HC-TCG.'
								}
								mode="tutorial"
								selectedMode={mode}
								setSelectedMode={setMode}
								selectedDeck={tutorialDeck}
							>
								<div className={css.buttonMenu}>
									<div>
										<p>
											Join a game here to learn the rules of HC-TCG before
											facing online opponents.
										</p>
									</div>
									<Button onClick={handeJoinQueue}>Join Queue</Button>
								</div>
							</HermitButton>
						</div>
					</div>
				</div>
				<div className={css.bottomButtons}>
					<Button className={css.bigButton} variant="primary">
						This is where your user info would go
					</Button>
				</div>
			</MenuLayout>
		</>
	)
}

export default GameLanding
