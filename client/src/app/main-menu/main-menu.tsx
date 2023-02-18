import {useDispatch} from 'react-redux'
import {
	randomMatchmaking,
	createPrivateGame,
	joinPrivateGame,
} from 'logic/matchmaking/matchmaking-actions'
import css from './main-menu.module.css'
import {logout} from 'logic/session/session-actions'
import TcgLogo from 'components/tcg-logo'
import LinkContainer from 'components/link-container'

type Props = {
	setMenuSection: (section: string) => void
}
function MainMenu({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const handleRandomMatchmaking = () => dispatch(randomMatchmaking())
	const handleCreatePrivateGame = () => dispatch(createPrivateGame())
	const handleJoinPrivateGame = () => dispatch(joinPrivateGame())
	const handleLogOut = () => dispatch(logout())
	const handleDeck = () => setMenuSection('deck')

	return (
		/* Background Image */
		<div className={css.menuBackground}>
			{/* Main Container */}
			<div className={css.menuContainer}>
				{/* Logo Container */}
				<TcgLogo />

				{/* Button Container */}
				<div className={css.buttonContainer}>
					<button className={css.menuButton} onClick={handleRandomMatchmaking}>
						Public Game
					</button>
					<button className={css.menuButton} onClick={handleCreatePrivateGame}>
						Create Private Game
					</button>
					<button className={css.menuButton} onClick={handleJoinPrivateGame}>
						Join Private Game
					</button>
					<button className={css.menuButton} onClick={handleDeck}>
						Customize Deck
					</button>

					{/* Smaller Button Container */}
					<div className={css.smallButtonContainer}>
						<button className={css.smallMenuButton} onClick={handleLogOut}>
							Log Out
						</button>
						<button className={css.smallMenuButton} disabled={true}>
							Settings
						</button>
					</div>
					<LinkContainer />
				</div>
				{/* Padding */}
				<div className={css.bottomPadding}></div>
			</div>
		</div>
	)
}

export default MainMenu
