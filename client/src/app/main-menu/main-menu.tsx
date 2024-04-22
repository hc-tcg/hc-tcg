import {useDispatch, useSelector} from 'react-redux'
import {joinQueue, createPrivateGame, joinPrivateGame} from 'logic/matchmaking/matchmaking-actions'
import {logout} from 'logic/session/session-actions'
import {getSession, getUpdates} from 'logic/session/session-selectors'
import css from './main-menu.module.scss'
import TcgLogo from 'components/tcg-logo'
import Beef from 'components/beef'
import Button from 'components/button'
import {VersionLinks} from 'components/link-container'
import {useState} from 'react'
import AlertModal from 'components/alert-modal'

type Props = {
	setMenuSection: (section: string) => void
}
function MainMenu({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const {playerName, playerDeck} = useSelector(getSession)
	const handleJoinQueue = () => dispatch(joinQueue())
	const handleCreatePrivateGame = () => dispatch(createPrivateGame())
	const handleJoinPrivateGame = () => dispatch(joinPrivateGame())
	const handleLogOut = () => dispatch(logout())
	const handleDeck = () => setMenuSection('deck')
	const handleSettings = () => setMenuSection('settings')

	const updates = useSelector(getUpdates)
	const [updatesOpen, setUpdatesOpen] = useState<boolean>(true)
	const latestUpdateView = localStorage.getItem('latestUpdateView')

	const welcomeMessage = playerDeck.name === 'Starter Deck' ? 'Welcome' : 'Welcome Back'

	return (
		<>
			{!updates['timestamps'] ||
			!latestUpdateView ||
			parseInt(updates['timestamps'][0]) > parseInt(latestUpdateView) ? (
				<AlertModal
					setOpen={updatesOpen}
					onClose={() => {
						setUpdatesOpen(false)
						localStorage.setItem('latestUpdateView', (new Date().valueOf() / 1000).toFixed())
					}}
					cancelText="Close"
					title="Latest updates"
					action={() => {}}
					description={
						<ul className={css.updatesList}>
							{updates['updates'] ? (
								updates['updates'].map((text, i) => (
									<li className={css.updateItem} key={i}>
										{text.split('\n').map((line) => (
											<p>{line}</p>
										))}
									</li>
								))
							) : (
								<li className={css.updateItem}>Failed to load updates</li>
							)}
							<li className={css.updateItem}>For more updates, visit the HC-TCG discord.</li>
						</ul>
					}
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
		</>
	)
}

export default MainMenu
