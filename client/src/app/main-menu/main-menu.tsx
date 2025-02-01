import {getCardTypeIcon} from 'common/cards/card'
import {getIconPath} from 'common/utils/state-gen'
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

	const handleGame = () => {
		setMenuSection('play-select')
	}

	const handleDeck = () => setMenuSection('deck')
	const handleSettings = () => setMenuSection('settings')
	const handleStatistics = () => setMenuSection('statistics')
	const handleAchievements = () => setMenuSection('achievements')

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
							id={css.more}
							onClick={handleStatistics}
							className={css.mainMenuButton}
						>
							More
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
