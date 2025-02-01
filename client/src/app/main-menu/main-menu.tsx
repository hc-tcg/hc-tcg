import {getCardTypeIcon} from 'common/cards/card'
import {getIconPath} from 'common/utils/state-gen'
import Beef from 'components/beef'
import Button from 'components/button'
import {VersionLinks} from 'components/link-container'
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

	const handleGame = () => {
		setMenuSection('game-landing')
	}

	const handleLogOut = () => {
		dispatch({type: localMessages.EVERY_TOAST_CLOSE})
		dispatch({type: localMessages.LOGOUT})
	}
	const handleDeck = () => setMenuSection('deck')
	const handleSettings = () => setMenuSection('settings')
	const handleAchievements = () => setMenuSection('achievements')

	const updates = useSelector(getUpdates)
	const [updatesOpen, setUpdatesOpen] = useState<boolean>(true)
	const latestUpdateView = localStorage.getItem('latestUpdateView')

	const welcomeMessage = newPlayer ? 'Welcome' : 'Welcome Back'

	return (
		<>
			{!latestUpdateView ||
			parseInt(updates['timestamps'] ? updates['timestamps'][0] : '0') >
				parseInt(latestUpdateView) ? (
				debugOptions.showUpdatesModal &&
				updatesOpen && <UpdatesModal onClose={() => setUpdatesOpen(false)} />
			) : (
				<></>
			)}
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
						<Button
							variant="primary"
							id={css.public}
							onClick={handleGame}
							className={css.mainMenuButton}
						>
							Play
						</Button>
						<Button
							variant="default"
							id={css.deck}
							onClick={handleDeck}
							className={css.mainMenuButton}
						>
							Deck Editor
						</Button>
						<Button
							variant="default"
							id={css.settings}
							onClick={handleSettings}
							className={css.mainMenuButton}
						>
							More
						</Button>
						<Button
							variant="default"
							id={css.achievements}
							onClick={handleAchievements}
							className={css.mainMenuButton}
						>
							Achievements
						</Button>
						<Button
							variant="default"
							id={css.hof}
							onClick={handleLogOut}
							className={css.mainMenuButton}
						>
							Profile
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
