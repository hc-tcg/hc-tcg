import Beef from 'components/beef'
import Button from 'components/button'
import {VersionLinks} from 'components/link-container'
import TcgLogo from 'components/tcg-logo'
import UpdatesModal from 'components/updates'
import {localMessages, useActionDispatch} from 'logic/messages'
import {getSession, getUpdates} from 'logic/session/session-selectors'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}
function MainMenu({setMenuSection}: Props) {
	const dispatch = useActionDispatch()
	const {playerName, playerDeck} = useSelector(getSession)
	const handleJoinQueue = () =>
		dispatch({type: localMessages.MATCHMAKING_QUEUE_JOIN})
	const handleCreatePrivateGame = () =>
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_CREATE})
	const handleJoinPrivateGame = () =>
		dispatch({type: localMessages.MATCHMAKING_PRIVATE_GAME_JOIN})
	const handleLogOut = () => dispatch({type: localMessages.LOGOUT})
	const handleDeck = () => setMenuSection('deck')
	const handleSettings = () => setMenuSection('settings')

	const updates = useSelector(getUpdates)
	const [updatesOpen, setUpdatesOpen] = useState<boolean>(true)
	const latestUpdateView = localStorage.getItem('latestUpdateView')

	const welcomeMessage =
		playerDeck.name === 'Starter Deck' ? 'Welcome' : 'Welcome Back'

	return (
		<>
			{!latestUpdateView ||
			parseInt(updates['timestamps'] ? updates['timestamps'][0] : '0') >
				parseInt(latestUpdateView) ? (
				<UpdatesModal
					updatesOpen={updatesOpen}
					setUpdatesOpen={setUpdatesOpen}
				/>
			) : (
				<></>
			)}
			<div className={css.mainmenu}>
				<div className={css.playerInfo}>
					<p id={css.infoName}>
						{welcomeMessage}, {playerName}
					</p>
					<p id={css.infoDeck}>{'Active Deck - ' + playerDeck.name}</p>
					<img
						id={css.infoIcon}
						src={`/images/types/type-${playerDeck.icon}.png`}
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
						<Button
							variant="stone"
							id={css.privateCreate}
							onClick={handleCreatePrivateGame}
						>
							Create Private Game
						</Button>
						<Button
							variant="stone"
							id={css.privateJoin}
							onClick={handleJoinPrivateGame}
						>
							Join Private Game
						</Button>
						<Button variant="stone" id={css.deck} onClick={handleDeck}>
							Customize Deck
						</Button>
						<Button variant="stone" id={css.settings} onClick={handleSettings}>
							More
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
