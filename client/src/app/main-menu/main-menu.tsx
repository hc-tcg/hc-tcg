import {getCardTypeIcon} from 'common/cards/card'
import {getIconPath} from 'common/utils/state-gen'
import {validateDeck} from 'common/utils/validation'
import Beef from 'components/beef'
import Button from 'components/button'
import {VersionLinks} from 'components/link-container'
import {Modal} from 'components/modal'
import TcgLogo from 'components/tcg-logo'
import UpdatesModal from 'components/updates'
import debugOptions from 'debug'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {getSession, getUpdates} from 'logic/session/session-selectors'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}

function MainMenu({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const {
		playerName,
		playerDeck: playerDeckCode,
		newPlayer,
	} = useSelector(getSession)
	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const playerDeck = databaseInfo?.decks.find(
		(deck) => deck.code === playerDeckCode,
	)

	const checkForValidation = (): boolean => {
		if (!playerDeckCode || !playerDeck) {
			dispatch({
				type: localMessages.TOAST_OPEN,
				open: true,
				title: 'You currently have no active deck selected!',
				description: 'Go to the deck builder to select an active deck.',
				image: '/images/types/type-any.png',
			})
			return false
		}
		const validation = validateDeck(playerDeck.cards.map((card) => card.props))
		if (validation.valid) return true
		dispatch({
			type: localMessages.TOAST_OPEN,
			open: true,
			title: 'Your deck is not valid!',
			description: `The deck "${playerDeck.name}" does not meet validation requirements.`,
			image: `/images/types/type-${playerDeck.icon}.png`,
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
	const handleSoloGame = () => {
		const valid = checkForValidation()
		if (!valid) return
		setMenuSection('boss-landing')
	}

	const handleLogOut = () => {
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
		dispatch({type: localMessages.LOGOUT})
	}
	const handleDeck = () => setMenuSection('deck')
	const handleSettings = () => setMenuSection('settings')

	const updates = useSelector(getUpdates)
	const [updatesOpen, setUpdatesOpen] = useState<boolean>(true)
	const [riddleModal, showRiddleModal] = useState<boolean>(false)
	const latestUpdateView = localStorage.getItem('latestUpdateView')

	const welcomeMessage = newPlayer ? 'Welcome' : 'Welcome Back'

	let showUpdateModal =
		(!latestUpdateView ||
			(updates.length && updates[0].timestamp > parseInt(latestUpdateView))) &&
		debugOptions.showUpdatesModal !== false

	return (
		<>
			{showUpdateModal ? (
				updatesOpen && <UpdatesModal onClose={() => setUpdatesOpen(false)} />
			) : (
				<></>
			)}
			<Modal
				setOpen={riddleModal}
				onClose={() => showRiddleModal(false)}
				title={'The Riddle'}
			>
				<Modal.Description>
					<p>
						Our next update is going to be big. So we created a riddle that
						reveals the release date.
					</p>
					<p>
						Begin in the place where this all began, Weave nonsense by join
						date, you'll find that you can.
					</p>
					<p>
						Create a statement that makes sense as a whole, Take the first of
						each second - you're halfway to your goal!
					</p>
					<p>
						Select the parts that create a tone, Put them in order, they're no
						use alone.
					</p>
					<p>
						Then number the hearts to discover the key Triple each part and use
						- then you'll see!
					</p>
					<p>
						<b>Want to help solve the riddle? Join our discord!</b>
					</p>
					<Button
						onClick={() => {
							window.open('https://discord.gg/uk4evqT7Ep')
						}}
					>
						Join Discord
					</Button>
				</Modal.Description>
			</Modal>
			<div className={css.mainmenu}>
				<div className={css.playerInfo}>
					<p id={css.infoName}>
						{welcomeMessage}, {playerName}
					</p>
					<p id={css.infoDeck}>
						{'Active Deck - ' + `${playerDeck ? playerDeck.name : 'None'}`}
					</p>
					<img
						id={css.infoIcon}
						src={playerDeck ? getIconPath(playerDeck) : getCardTypeIcon('any')}
						alt="deck-icon"
					/>
				</div>
				<div className={css.content}>
					<div className={css.logo}>
						<TcgLogo />
					</div>
					<nav>
						<Button variant="stone" id={css.public} onClick={handleJoinQueue}>
							Public Game
						</Button>
						<Button variant="stone" id={css.soloGame} onClick={handleSoloGame}>
							Single Player
						</Button>
						<Button
							variant="stone"
							id={css.privateCreate}
							onClick={handlePrivateGame}
						>
							Private Game
						</Button>
						<Button variant="stone" id={css.deck} onClick={handleDeck}>
							Browse Decks
						</Button>
						<Button variant="stone" id={css.settings} onClick={handleSettings}>
							More
						</Button>
						<Button
							variant="primary"
							id={css.riddle}
							onClick={() => showRiddleModal(true)}
						>
							<div>The Riddle</div>
						</Button>
						<Button variant="stone" id={css.logout} onClick={handleLogOut}>
							Log Out
						</Button>
					</nav>
					<Beef />
					<VersionLinks />
				</div>
			</div>
		</>
	)
}

export default MainMenu
