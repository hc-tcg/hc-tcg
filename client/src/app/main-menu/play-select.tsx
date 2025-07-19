import classNames from 'classnames'
import {CARDS} from 'common/cards'
import BerryBush from 'common/cards/advent-of-tcg/attach/berry-bush'
import Dropper from 'common/cards/advent-of-tcg/single-use/dropper'
import Glowstone from 'common/cards/advent-of-tcg/single-use/glowstone'
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
import {CONFIG} from 'common/config'
import {EXPANSIONS} from 'common/const/expansions'
import {CardEntity} from 'common/entities'
import {Deck} from 'common/types/deck'
import {LocalCardInstance} from 'common/types/server-requests'
import {sortDecks} from 'common/utils/decks'
import {validateDeck} from 'common/utils/validation'
import Button from 'components/button'
import CardList from 'components/card-list'
import GameModeButton from 'components/game-mode-button'
import {CodeInfo} from 'components/game-mode-button/game-mode-button'
import MenuLayout from 'components/menu-layout'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {
	getGameCode,
	getSpectatorCode,
	getStatus,
} from 'logic/matchmaking/matchmaking-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {getRematchData, getSession} from 'logic/session/session-selectors'
import {useEffect, useReducer, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {CosmeticPreview} from './achievements'
import css from './play-select.module.scss'

type Props = {
	setMenuSection: (section: string) => void
	defaultSection?: string
	firstActiveMenu?: string
	prefillSpectatorCode?: string
	prefillJoinCode?: string
}

function PlaySelect({
	setMenuSection,
	defaultSection,
	firstActiveMenu,
	prefillJoinCode,
	prefillSpectatorCode,
}: Props) {
	const dispatch = useMessageDispatch()
	const matchmaking = useSelector(getStatus)
	const settings = useSelector(getSettings)
	const gameCode = useSelector(getGameCode)
	const spectatorCode = useSelector(getSpectatorCode)
	const {playerDeck} = useSelector(getSession)
	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const rematch = useSelector(getRematchData)

	const gameTypeButtonsRef = useRef<HTMLDivElement>(null)

	const decks = databaseInfo?.decks

	const [, _refresh] = useReducer((x) => x + 1, 0)

	const [loadedDeck, setLoadedDeck] = useState<Deck | undefined>(
		databaseInfo?.decks.find((deck) => deck.code === playerDeck),
	)

	// Menu state
	const [activeMode, setActiveMode] = useState<string | null>(
		defaultSection || null,
	)

	const getFirstActiveMenu = (section: string) => {
		if (firstActiveMenu) return firstActiveMenu
		if (section === 'public') return 'publicChooseDeck'
		if (section === 'private') return 'privateOptions'
		if (section === 'boss') return 'bossSelect'
		if (section === 'rematch') return 'rematchChooseDeck'
		return ''
	}

	const [activeButtonMenu, setActiveButtonMenu] = useState<string | null>(
		defaultSection ? getFirstActiveMenu(defaultSection) : null,
	)

	// Back stack
	const [backStack, setBackStack] = useState<Array<string>>([])
	const addMenuWithBack = (buttonMenu: string) => {
		if (activeButtonMenu) {
			// Add last menu to stack
			setBackStack([...backStack, activeButtonMenu])
		}
		setActiveButtonMenu(buttonMenu)
	}

	const goBack = () => {
		const lastMenu = backStack.splice(-1)[0]
		if (lastMenu) {
			setActiveButtonMenu(lastMenu)
			setBackStack(backStack)
		} else {
			setActiveMode(null)
			setActiveButtonMenu(null)
			setBackStack([])
		}
	}

	const [hasRematch, setHasRematch] = useState<boolean>(rematch ? true : false)
	const [rematchDisabled, setRematchDisabled] = useState<boolean>(false)

	const rematchCancel = () => {
		if (!rematch) return
		dispatch({type: localMessages.CANCEL_REMATCH})
	}

	if (hasRematch && !rematch) {
		setHasRematch(false)
		setRematchDisabled(true)
		if (activeMode === 'rematch') {
			setActiveMode(null)
			setActiveButtonMenu(null)
			setBackStack([])
		}
	}

	// I am sorry but I couldn't get the refs to work when you go to a game mode button immediately on mobile
	// This code is not great, but it basically works. Can't really see a difference on all display sizes I checked
	const mobileTop =
		gameTypeButtonsRef.current?.getBoundingClientRect().top ||
		window.screen.height * 0.11

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
		const validation = validateDeck(
			loadedDeck.cards.map((card) => CARDS[card.id]),
		)
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

	// Deck management
	const sortDecksByActive = () => {
		// Sort decks, placing active at the top
		sortDecks(
			decks,
			settings.deckSortingMethod,
			loadedDeck ? loadedDeck.code : null,
		)
	}
	const onSelectDeck = (deck: Deck) => {
		setLoadedDeck(deck)

		if (loadedDeck?.code !== deck.code) {
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

		dispatch({
			type: localMessages.UPDATE_DECKS,
			newActiveDeck: deck,
		})
	}

	const handleLeaveQueue = () => {
		dispatch({type: localMessages.MATCHMAKING_LEAVE})
	}

	const handleCodeClick = (code: CodeInfo) => {
		navigator.clipboard.writeText(code.code)

		dispatch({
			type: localMessages.TOAST_OPEN,
			open: true,
			title: 'Code copied!',
			description: `Copied ${code.name} to clipboard.`,
			image: 'copy',
		})
	}

	/* Boss game stuff */
	function createUICardInstance(card: Card): LocalCardInstance {
		return {
			id: card.numericId,
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

	const directlyOppositeCards = [Anvil, RenbobRare, PoePoeSkizzRare]
		.filter(removeDisabledExpansions)
		.map(createUICardInstance)

	/* Keys */
	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress)
		return () => {
			window.removeEventListener('keydown', handleKeyPress)
		}
	}, [handleKeyPress])

	function handleKeyPress(e: KeyboardEvent) {
		if (!matchmaking && e.key === 'Escape') {
			if (backStack[0]) {
				goBack()
			} else if (activeMode) {
				setActiveMode(null)
				setActiveButtonMenu(null)
				setBackStack([])
			}
		}
	}

	let header = 'Select a game mode:'
	switch (activeMode) {
		case 'public':
			header = 'Public Game'
			break
		case 'rematch':
			header = 'Rematch'
			break
		case 'private':
			header = 'Private Game'
			break
		case 'boss':
			header = 'Boss Battle'
			break
		default:
			break
	}

	return (
		<>
			<MenuLayout
				back={() => {
					handleLeaveQueue()
					setMenuSection('main-menu')
				}}
				title="Play"
				returnText="Main Menu"
				className={css.playSelect}
			>
				<h2 className={css.header}>{header}</h2>
				<div className={css.gameTypes}>
					<div
						className={classNames(css.gameTypesButtons)}
						ref={gameTypeButtonsRef}
					>
						<GameModeButton
							image={'vintagebeef'}
							backgroundImage={'gamemodes/public'}
							title={'Public Game'}
							description={
								'Challenge a random player to a game of HC-TCG Online!'
							}
							mode="public"
							activeMode={activeMode}
							setActiveMode={setActiveMode}
							onSelect={() => {
								addMenuWithBack('publicChooseDeck')
								sortDecksByActive()
							}}
							onBack={goBack}
							disableBack={!!matchmaking}
							mobileTop={mobileTop}
							enableRematch={!!rematch && !rematch.spectatorCode}
							timerStart={rematch?.time}
							timerLength={CONFIG.game.limits.rematchTime}
							onRematchSelect={() => {
								addMenuWithBack('rematchChooseDeck')
								sortDecksByActive()
							}}
							onRematchCancel={rematchCancel}
						>
							<GameModeButton.ChooseDeck
								activeButtonMenu={activeButtonMenu}
								id="publicChooseDeck"
								title="Choose your deck"
								subTitle="When ready, press the Join Queue button to begin."
								confirmMessage="Join Queue"
								disableButton={loadedDeck === undefined}
								onConfirm={() => {
									const valid = checkForValidation()
									if (!valid) return
									dispatch({type: localMessages.EVERY_TOAST_CLOSE})
									dispatch({type: localMessages.MATCHMAKING_JOIN_PUBLIC_QUEUE})
									addMenuWithBack('publicQueue')
								}}
								decks={decks}
								onSelectDeck={onSelectDeck}
							/>
							<GameModeButton.Queue
								activeButtonMenu={activeButtonMenu}
								id="publicQueue"
								joiningMessage="Joining queue..."
								queueMessage="Searching for game..."
								timedMessage={
									<>
										Can't find an opponent?<> </>
										<a
											href="https://discord.gg/AjGbqNfcQX"
											target="_blank"
											rel="noreferrer"
											title="Discord"
										>
											Join our discord!
										</a>
									</>
								}
								activeDeck={loadedDeck}
								matchmakingStatus={matchmaking}
								cancelMessage="Leave Queue"
								onCancel={() => {
									if (matchmaking) handleLeaveQueue()
									goBack()
								}}
							/>
						</GameModeButton>
						<GameModeButton
							image={'cubfan135'}
							backgroundImage={'gamemodes/private'}
							title={'Private Game'}
							description={'Play against your friends in a private lobby.'}
							mode="private"
							activeMode={activeMode}
							setActiveMode={setActiveMode}
							onSelect={() => {
								addMenuWithBack('privateOptions')
								sortDecksByActive()
							}}
							onBack={goBack}
							disableBack={!!matchmaking}
							mobileTop={mobileTop}
							enableRematch={!!rematch && !!rematch.spectatorCode}
							timerStart={rematch?.time}
							timerLength={CONFIG.game.limits.rematchTime}
							onRematchSelect={() => {
								addMenuWithBack('rematchChooseDeck')
								sortDecksByActive()
							}}
							onRematchCancel={rematchCancel}
						>
							<GameModeButton.OptionsSelect
								activeButtonMenu={activeButtonMenu}
								id="privateOptions"
								title="Select an option"
								subTitle="Either join a private game created by another player, spectate an existing game, 
or create your own game to challenge someone else."
								buttons={[
									{
										text: 'Join Game',
										onClick() {
											addMenuWithBack('privateJoinGame')
										},
									},
									{
										text: 'Spectate Game',
										onClick() {
											addMenuWithBack('privateSpectateGame')
										},
									},
									{
										text: 'Create Game',
										onClick() {
											addMenuWithBack('createPrivateGame')
										},
									},
								]}
							/>
							<GameModeButton.ChooseDeck
								activeButtonMenu={activeButtonMenu}
								id="privateJoinGame"
								title="Join Private Game"
								subTitle="Choose your deck, enter the code, and then press the Confirm button to begin."
								confirmMessage="Confirm"
								requestCode
								defaultCode={prefillJoinCode}
								disableButton={loadedDeck === undefined}
								onConfirm={(code) => {
									const valid = checkForValidation()
									if (!valid) return

									if (!code || code.length !== 6) {
										dispatch({
											type: localMessages.TOAST_OPEN,
											open: true,
											title: 'Invalid Code!',
											description: 'The code you entered is invalid.',
										})
										return
									}

									dispatch({type: localMessages.EVERY_TOAST_CLOSE})
									dispatch({
										type: localMessages.MATCHMAKING_JOIN_PRIVATE_QUEUE,
										code,
									})
									addMenuWithBack('privateJoinQueue')
								}}
								decks={decks}
								onSelectDeck={onSelectDeck}
							/>
							<GameModeButton.EnterCode
								activeButtonMenu={activeButtonMenu}
								id="privateSpectateGame"
								title="Spectate Private Game"
								subTitle="Enter the spectator code, then press the Confirm button to join the game."
								placeholder="Enter spectator code..."
								confirmMessage="Confirm"
								defaultCode={prefillSpectatorCode}
								onConfirm={(code) => {
									if (!code || code.length !== 6) {
										dispatch({
											type: localMessages.TOAST_OPEN,
											open: true,
											title: 'Invalid Code!',
											description: 'The code you entered is invalid.',
										})
										return
									}

									dispatch({type: localMessages.EVERY_TOAST_CLOSE})
									dispatch({
										type: localMessages.MATCHMAKING_SPECTATE_PRIVATE_GAME,
										code,
									})
									addMenuWithBack('privateSpectateQueue')
								}}
							/>
							<GameModeButton.ChooseDeck
								activeButtonMenu={activeButtonMenu}
								id="createPrivateGame"
								title="Create Private Game"
								subTitle="Choose your deck, then press the Confirm button to begin."
								confirmMessage="Confirm"
								disableButton={loadedDeck === undefined}
								onConfirm={() => {
									const valid = checkForValidation()
									if (!valid) return

									dispatch({type: localMessages.EVERY_TOAST_CLOSE})
									dispatch({
										type: localMessages.MATCHMAKING_CREATE_PRIVATE_GAME,
									})
									addMenuWithBack('createGameQueue')
								}}
								decks={decks}
								onSelectDeck={onSelectDeck}
							/>
							<GameModeButton.Queue
								activeButtonMenu={activeButtonMenu}
								id="privateJoinQueue"
								joiningMessage="Verifying code..."
								queueMessage="Waiting for opponent..."
								activeDeck={loadedDeck}
								matchmakingStatus={matchmaking}
								cancelMessage="Cancel"
								onCancel={() => {
									if (matchmaking) handleLeaveQueue()
									goBack()
								}}
							/>
							<GameModeButton.Queue
								activeButtonMenu={activeButtonMenu}
								id="privateSpectateQueue"
								joiningMessage="Verifying spectator code..."
								queueMessage="Waiting for game to begin..."
								matchmakingStatus={matchmaking}
								cancelMessage="Cancel"
								onCancel={() => {
									if (matchmaking) handleLeaveQueue()
									goBack()
								}}
							/>
							<GameModeButton.Queue
								activeButtonMenu={activeButtonMenu}
								id="createGameQueue"
								joiningMessage="Creating game..."
								queueMessage="Waiting for opponent..."
								activeDeck={loadedDeck}
								codes={
									gameCode && spectatorCode
										? [
												{name: 'Opponent Code', code: gameCode},
												{name: 'Spectator Code', code: spectatorCode},
											]
										: undefined
								}
								onCodeClick={handleCodeClick}
								matchmakingStatus={matchmaking}
								cancelMessage="Cancel Game"
								onCancel={() => {
									if (matchmaking) handleLeaveQueue()
									goBack()
								}}
							/>
						</GameModeButton>
						<GameModeButton
							image={'evilxisuma'}
							backgroundImage={'gamemodes/boss'}
							title={'Boss Battle'}
							description={
								'Prove your worth as an HC-TCG player by challenging Evil X to a fight.'
							}
							mode="boss"
							activeMode={activeMode}
							onSelect={() => {
								addMenuWithBack('bossSelect')
								sortDecksByActive()
							}}
							setActiveMode={setActiveMode}
							onBack={goBack}
							disableBack={!!matchmaking}
							mobileTop={mobileTop}
							enableRematch={false}
						>
							<GameModeButton.OptionsSelect
								id="bossSelect"
								activeButtonMenu={activeButtonMenu}
								title="Welcome to your doom."
								subTitle="That's right, HC-TCG Online has its first boss fight! This is no challenge deck - Evil X cares
not for the cards. He brings his own moves, and they are vicious! If you think you can defeat him, you'll
need to be on your best game. Make sure your audio is enabled, as you'll need to listen to voice commands
during the battle."
								buttons={[
									{
										text: 'Full Rules',
										onClick() {
											addMenuWithBack('bossRules')
										},
									},
									{
										text: 'Challenge Evil X',
										onClick() {
											addMenuWithBack('bossChooseDeck')
										},
										variant: 'primary',
									},
								]}
							/>
							<GameModeButton.CustomMenu
								id="bossRules"
								activeButtonMenu={activeButtonMenu}
							>
								<div className={css.bossRules}>
									<h3>Full Rules</h3>
									<p>
										You will always go first but can only have three rows to
										play on.
									</p>
									<p>
										EX has only one row to play on and has no item slots to
										attach to his boss card. However, his card has 300hp, comes
										back again at full health when knocked out, and will perform
										harder attacks with every life lost.
									</p>
									{directlyOppositeCards.length
										? [
												<p>
													EX is always directly opposite your active Hermit for
													the purposes of:
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
										EX is immune to and cannot be inflicted with Fire, Poison,
										and Slowness.
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
										After losing a life, EX can also either heal for 150hp, set
										your active Hermit on fire, or double the damage of his main
										attack.
									</p>
									<p>
										On his last life, EX can deal 20 damage to all AFK Hermits,
										discard your active Hermit's attached effect card, or force
										you to discard an item card from your active Hermit.
										Discarded effect cards act as if <u>Curse of Vanishing</u>{' '}
										was used and do not trigger from his attack.
									</p>
									<p>
										If a special move disables EX's attack, this only prevents
										attack damage, being set on fire and damage against AFK
										Hermits.
									</p>
									<p>
										At the end of EX's ninth turn, even if he cannot attack, he
										will perform one of two special moves:
									</p>
									<ol>
										<li>Discard your whole hand and draw one new card.</li>
										<li>
											Remove all attached item and effect cards from your active
											Hermit.
										</li>
									</ol>
									<Button className={css.rulesBack} onClick={goBack}>
										Go Back
									</Button>
								</div>
							</GameModeButton.CustomMenu>
							<GameModeButton.ChooseDeck
								activeButtonMenu={activeButtonMenu}
								id="bossChooseDeck"
								title="Choose your deck"
								subTitle="When ready, press the Fight! button to begin."
								confirmMessage="Fight!"
								disableButton={loadedDeck === undefined}
								onConfirm={() => {
									const valid = checkForValidation()
									if (!valid) return

									dispatch({type: localMessages.EVERY_TOAST_CLOSE})
									dispatch({
										type: localMessages.MATCHMAKING_CREATE_BOSS_GAME,
									})
								}}
								decks={decks}
								onSelectDeck={onSelectDeck}
							/>
						</GameModeButton>
					</div>
					<div className={css.rematchWindow}>
						{activeMode === 'rematch' && (
							<GameModeButton
								image={'fiveampearl'}
								backgroundImage={'gamemodes/rematch'}
								title={'Rematch'}
								description={
									'Click within the time limit to rematch your opponent.'
								}
								mode="rematch"
								activeMode={activeMode}
								setActiveMode={setActiveMode}
								onSelect={() => {
									addMenuWithBack('rematchChooseDeck')
									sortDecksByActive()
								}}
								onBack={goBack}
								disableBack={!!matchmaking}
								mobileTop={mobileTop}
								timerStart={rematch?.time || 0}
								timerLength={CONFIG.game.limits.rematchTime}
								disabled={rematchDisabled}
								enableRematch={false}
							>
								<GameModeButton.ChooseDeck
									activeButtonMenu={activeButtonMenu}
									id="rematchChooseDeck"
									title="Choose your deck"
									subTitle={`Current score: ${rematch?.playerScore} - ${rematch?.opponentScore}`}
									confirmMessage="Rematch"
									disableButton={loadedDeck === undefined}
									onConfirm={() => {
										const valid = checkForValidation()
										if (!valid) return
										dispatch({type: localMessages.EVERY_TOAST_CLOSE})
										dispatch({type: localMessages.MATCHMAKING_REMATCH})
										addMenuWithBack('rematchQueue')
									}}
									decks={decks}
									onSelectDeck={onSelectDeck}
								/>
								<GameModeButton.Queue
									activeButtonMenu={activeButtonMenu}
									id="rematchQueue"
									joiningMessage="Creating game..."
									queueMessage="Waiting for opponent..."
									activeDeck={loadedDeck}
									matchmakingStatus={matchmaking}
									cancelMessage="Leave Queue"
									onCancel={() => {
										if (matchmaking) handleLeaveQueue()
										goBack()
									}}
								/>
							</GameModeButton>
						)}
					</div>
				</div>
				<h3 className={css.appearanceHeader}>In-game Appearance</h3>
				<p
					className={classNames(
						css.clickToChange,
						matchmaking && css.disableBack,
					)}
				>
					<i>Click to change</i>
				</p>
				<div
					className={classNames(
						css.appearance,
						!matchmaking && css.appearanceClickable,
					)}
					onClick={() => !matchmaking && setMenuSection('cosmetics')}
				>
					<CosmeticPreview />
				</div>
			</MenuLayout>
		</>
	)
}

export default PlaySelect
