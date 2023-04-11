import {useDispatch} from 'react-redux'
import {useState} from 'react'
import {
	randomMatchmaking,
	createPrivateGame,
	joinPrivateGame,
} from 'logic/matchmaking/matchmaking-actions'
import css from './main-menu.module.scss'
import {logout} from 'logic/session/session-actions'
import TcgLogo from 'components/tcg-logo'
import LinkContainer from 'components/link-container'
import More from './main-menu-more'
import Beef from 'components/beef'
import classNames from 'classnames'
import Button from 'components/button'

type Props = {
	setMenuSection: (section: string) => void
}
function MainMenu({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const [subsection, setSubsection] = useState<string | null>(null)

	const handleRandomMatchmaking = () => dispatch(randomMatchmaking())
	const handleCreatePrivateGame = () => dispatch(createPrivateGame())
	const handleJoinPrivateGame = () => dispatch(joinPrivateGame())
	const handleLogOut = () => dispatch(logout())
	const handleDeck = () => setMenuSection('deck')

	let content = null

	if (subsection === 'more') {
		content = <More setMenuSection={() => setSubsection(null)} />
	} else {
		content = (
			<div className={css.menuBackground}>
				<div className={css.mainContainer}>
					{/* Button Container */}
					<TcgLogo />
					<div className={css.mainButtonContainer}>
						<Button
							variant="stone"
							className={css.menuButton}
							onClick={handleRandomMatchmaking}
						>
							Public Game
						</Button>
						<Button
							variant="stone"
							className={css.menuButton}
							onClick={handleCreatePrivateGame}
						>
							Create Private Game
						</Button>
						<Button
							variant="stone"
							className={css.menuButton}
							onClick={handleJoinPrivateGame}
						>
							Join Private Game
						</Button>
						<Button
							variant="stone"
							className={classNames(css.menuButton)}
							onClick={handleDeck}
						>
							Customize Deck
						</Button>
						<div className={css.smallButtonContainer}>
							<Button
								variant="stone"
								className={css.menuButton}
								onClick={handleLogOut}
							>
								Log Out
							</Button>
							<Button
								variant="stone"
								className={css.menuButton}
								onClick={() => setSubsection('more')}
							>
								Settings
							</Button>
						</div>
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<LinkContainer />
						</div>
						<Beef />
					</div>
				</div>
			</div>
		)
	}

	return content
}

export default MainMenu
