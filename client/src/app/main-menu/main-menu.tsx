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
import {VersionLinks} from 'components/link-container'

type Props = {
	setMenuSection: (section: string) => void
}
function MainMenu({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const {playerName, playerDeck} = useSelector(getSession)
	const handleRandomMatchmaking = () => dispatch(randomMatchmaking())
	const handleCreatePrivateGame = () => dispatch(createPrivateGame())
	const handleJoinPrivateGame = () => dispatch(joinPrivateGame())
	const handleLogOut = () => dispatch(logout())
	const handleDeck = () => setMenuSection('deck')
	const handleSettings = () => setMenuSection('settings')

	const welcomeMessage = playerDeck.name === 'Starter Deck' ? 'Welcome' : 'Welcome Back'

	return (
		<div className={css.mainmenu}>
			<div className={css.playerInfo}>
				<p id={css.infoName}>
					{welcomeMessage}, {playerName}
				</p>
				<p id={css.infoDeck}>{'Active Deck - ' + playerDeck.name}</p>
				<img id={css.infoIcon} src={`/images/types/type-${playerDeck.icon}.png`} alt="deck-icon" />
			</div>
			<div className={css.content}>
				<div className={css.logo}>
					<TcgLogo />
				</div>
				<nav>
					<Button variant="stone" id={css.public} onClick={handleRandomMatchmaking}>
						Public Game
					</Button>
					<Button variant="stone" id={css.privateCreate} onClick={handleCreatePrivateGame}>
						Create Private Game
					</Button>
					<Button variant="stone" id={css.privateJoin} onClick={handleJoinPrivateGame}>
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
	)
}

export default MainMenu
