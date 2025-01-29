import {validateDeck} from 'common/utils/validation'
import Button from 'components/button'
import HermitButton from 'components/hermit-button'
import MenuLayout from 'components/menu-layout'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {getSession} from 'logic/session/session-selectors'
import {useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import css from './games-landing.module.scss'
import {Deck, Tag} from 'common/types/deck'
import classNames from 'classnames'
import {getIconPath} from 'common/utils/state-gen'
import {setActiveDeck} from 'logic/saved-decks/saved-decks'

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
	const selectedDeckRef = useRef<HTMLLIElement>(null)

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
		dispatch({type: localMessages.MATCHMAKING_QUEUE_JOIN})
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
	}
	const handlePrivateGame = () => {
		const valid = checkForValidation()
		if (!valid) return
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_LOBBY})
	}
	const handleSoloGame = () => {
		const valid = checkForValidation()
		if (!valid) return
		setMenuSection('boss-landing')
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
			<li
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
			</li>
		)
	})

	return (
		<>
			<MenuLayout
				back={() => setMenuSection('mainmenu')}
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
								type="public"
								selectedKey={mode}
								setSelectedKey={setMode}
								selectedDeck={loadedDeck}
							>
								<div className={css.buttonMenu}>
									<div className={css.decksContainer}>
										<ul>{decksList}</ul>
									</div>
									<Button onClick={handeJoinQueue}>Join Queue</Button>
								</div>
							</HermitButton>
							<HermitButton
								image={'cubfan135'}
								backgroundImage={'gamemodes/private'}
								title={'Private Game'}
								description={'Play against your friends in a private lobby.'}
								type="private"
								selectedKey={mode}
								setSelectedKey={setMode}
								selectedDeck={loadedDeck}
							>
								<div className={css.buttonMenu}>
									<div className={css.decksContainer}>
										<ul>{decksList}</ul>
									</div>
									<Button onClick={handlePrivateGame}>Join Queue</Button>
								</div>
							</HermitButton>
							<HermitButton
								image={'evilxisuma'}
								backgroundImage={'gamemodes/boss'}
								title={'Boss Battle'}
								description={'Challenge Evil X to a fight. Blah Blah Blah Blah'}
								type="boss"
								selectedKey={mode}
								setSelectedKey={setMode}
								selectedDeck={loadedDeck}
							>
								<div className={css.buttonMenu}>
									<div className={css.decksContainer}>
										<ul>{decksList}</ul>
									</div>
									<Button onClick={handleSoloGame}>Join Queue</Button>
								</div>
							</HermitButton>
							<HermitButton
								image={'geminitay'}
								backgroundImage={'gamemodes/tutorial'}
								title={'Tutorial'}
								description={
									'Play a game against the computer to learn the rules of HC-TCG.'
								}
								type="custom"
								selectedKey={mode}
								setSelectedKey={setMode}
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
