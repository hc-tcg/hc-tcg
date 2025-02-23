import {getCardTypeIcon} from 'common/cards/card'
import {getIconPath} from 'common/utils/state-gen'
import Beef from 'components/beef'
import Button from 'components/button'
import {VersionLinks} from 'components/link-container'
import TcgLogo from 'components/tcg-logo'
import UpdatesModal from 'components/updates'
import debugOptions from 'debug'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {getSession, getUpdates} from 'logic/session/session-selectors'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}

function MainMenu({setMenuSection}: Props) {
	const handleGame = () => {
		setMenuSection('play-select')
	}

	const handleDeck = () => setMenuSection('deck')
	const handleMore = () => setMenuSection('more')
	const handleSettings = () => setMenuSection('settings')
	const handleAchievements = () => setMenuSection('achievements')

	const updates = useSelector(getUpdates)
	const [updatesOpen, setUpdatesOpen] = useState<boolean>(true)
	const latestUpdateView = localStorage.getItem('latestUpdateView')

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
							onClick={handleMore}
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
