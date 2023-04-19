import {useDispatch, useSelector} from 'react-redux'
import {
	randomMatchmaking,
	createPrivateGame,
	joinPrivateGame,
} from 'logic/matchmaking/matchmaking-actions'
import {logout} from 'logic/session/session-actions'
import {getSession} from 'logic/session/session-selectors'
import css from './main-menu.module.scss'
import TcgLogo from 'components/tcg-logo'
import Beef from 'components/beef'
import Button from 'components/button'

type Props = {
	setMenuSection: (section: string) => void
}
function MainMenu({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const {playerName} = useSelector(getSession)
	const handleRandomMatchmaking = () => dispatch(randomMatchmaking())
	const handleCreatePrivateGame = () => dispatch(createPrivateGame())
	const handleJoinPrivateGame = () => dispatch(joinPrivateGame())
	const handleLogOut = () => dispatch(logout())
	const handleDeck = () => setMenuSection('deck')
	const handleSettings = () => setMenuSection('settings')

	return (
		<div className={css.mainmenu}>
			{/* <Panorama /> */}
			<h2 className={css.welcome}>Welcome back, {playerName}!</h2>
			<div className={css.content}>
				<div className={css.logo}>
					<TcgLogo />
				</div>
				<nav>
					<Button
						variant="stone"
						className={css.menuButton}
						id={css.public}
						onClick={handleRandomMatchmaking}
					>
						Public Game
					</Button>
					<Button
						variant="stone"
						className={css.menuButton}
						onClick={handleCreatePrivateGame}
						id={css.pcreate}
					>
						Create Private Game
					</Button>
					<Button
						variant="stone"
						className={css.menuButton}
						onClick={handleJoinPrivateGame}
						id={css.pjoin}
					>
						Join Private Game
					</Button>
					<Button
						variant="stone"
						className={css.menuButton}
						id={css.deck}
						onClick={handleDeck}
					>
						Customize Deck
					</Button>
					<Button
						variant="stone"
						className={css.menuButton}
						id={css.settings}
						onClick={handleSettings}
					>
						Settings
					</Button>
					<Button
						variant="stone"
						className={css.menuButton}
						id={css.logout}
						onClick={handleLogOut}
					>
						Log Out
					</Button>
				</nav>
				<Beef />
			</div>
			<p className={css.version}>
				<span>Beta v0.5.1 - </span>
				<a
					href="https://www.reddit.com/r/HermitCraft/comments/10wksaw/hctcg_online/"
					target="_blank"
					rel="noreferrer"
					title="Reddit"
				>
					Reddit
				</a>
				<span> - </span>
				<a
					href="https://github.com/martinkadlec0/hc-tcg"
					target="_blank"
					rel="noreferrer"
					title="Github"
				>
					GitHub
				</a>
				<span> - </span>
				<a
					href="https://discord.gg/AjGbqNfcQX"
					target="_blank"
					rel="noreferrer"
					title="Discord"
				>
					Discord
				</a>
			</p>
		</div>
	)
}

export default MainMenu
