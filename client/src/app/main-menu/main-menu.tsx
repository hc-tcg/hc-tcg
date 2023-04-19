import {useDispatch, useSelector} from 'react-redux'
import {
	randomMatchmaking,
	createPrivateGame,
	joinPrivateGame,
} from 'logic/matchmaking/matchmaking-actions'
import css from './main-menu.module.scss'
import {logout} from 'logic/session/session-actions'
import TcgLogo from 'components/tcg-logo'
import LinkContainer from 'components/link-container'
import Beef from 'components/beef'
import classNames from 'classnames'
import Button from 'components/button'
import Panorama from './panorama'
import {getSession} from 'logic/session/session-selectors'

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
			<Panorama />
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
						className={classNames(css.menuButton)}
						id={css.deck}
						onClick={handleDeck}
					>
						Customize Deck
					</Button>
					<Button
						variant="stone"
						className={css.menuButton}
						id={css.logout}
						onClick={handleLogOut}
					>
						Log Out
					</Button>
					<Button
						variant="stone"
						className={css.menuButton}
						id={css.settings}
						onClick={handleSettings}
					>
						Settings
					</Button>
				</nav>
				<div style={{display: 'flex', justifyContent: 'center'}}>
					<LinkContainer />
				</div>
				<Beef />
			</div>
		</div>
	)
}

export default MainMenu
