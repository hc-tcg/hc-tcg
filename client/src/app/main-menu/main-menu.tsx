import {getCardTypeIcon} from 'common/cards/card'
import {getIconPath} from 'common/game/setup-game'
import Beef from 'components/beef'
import Button from 'components/button'
import {VersionLinks} from 'components/link-container'
import TcgLogo from 'components/tcg-logo'
import UpdatesModal from 'components/updates'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {getSession, getUpdates} from 'logic/session/session-selectors'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import queryOptions from '../../query-params'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}

function MainMenu({setMenuSection}: Props) {
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
		setMenuSection('play-select')
	}

	const handleDeck = () => setMenuSection('deck')
	const handleSettings = () => setMenuSection('settings')
	const handleAchievements = () => setMenuSection('achievements')
	const handleStatistics = () => setMenuSection('statistics')

	const updates = useSelector(getUpdates)
	const [updatesOpen, setUpdatesOpen] = useState<boolean>(true)
	const latestUpdateView = localStorage.getItem('latestUpdateView')

	const welcomeMessage = newPlayer ? 'Welcome' : 'Welcome Back'

	let showUpdateModal =
		(!latestUpdateView ||
			(updates.length && updates[0].timestamp > parseInt(latestUpdateView))) &&
		queryOptions.showUpdatesModal !== false

	return (
		<>
			{showUpdateModal ? (
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
							id={css.achievements}
							onClick={handleAchievements}
							className={css.mainMenuButton}
						>
							Achievements
						</Button>
						<Button
							variant="default"
							id={css.settings}
							onClick={handleSettings}
							className={css.mainMenuButton}
						>
							Settings
						</Button>
						<Button
							variant="default"
							id={css.statistics}
							onClick={handleStatistics}
							className={css.mainMenuButton}
						>
							Statistics
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
