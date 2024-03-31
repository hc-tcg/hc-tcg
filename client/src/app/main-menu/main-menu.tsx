import {useDispatch, useSelector} from 'react-redux'
import {joinQueue, createPrivateGame, joinPrivateGame} from 'logic/matchmaking/matchmaking-actions'
import {logout} from 'logic/session/session-actions'
import {getSession} from 'logic/session/session-selectors'
import css from './main-menu.module.scss'
import TcgLogo from 'components/tcg-logo'
import Beef from 'components/beef'
import Button from 'components/button'
import {VersionLinks} from 'components/link-container'
import {validateDeck} from 'common/utils/validation'
import {getUnlockedPermits} from 'logic/permits/permits-selectors'
import {ToastT} from 'common/types/app'

type Props = {
	setMenuSection: (section: string) => void
}
function MainMenu({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const {playerName, playerDeck} = useSelector(getSession)
	const playerPermits = useSelector(getUnlockedPermits)

	const dispatchToast = (toast: ToastT) => dispatch({type: 'SET_TOAST', payload: toast})

	const invalidDeckToast: ToastT = {
		open: true,
		title: 'Invalid Deck!',
		description: `Your selected deck, ${playerDeck.name}, is invalid.`,
		image: `/images/types/type-${playerDeck.icon}.png`,
	}

	const handleJoinQueue = () => {
		const validation = validateDeck(
			playerDeck.cards.map((card) => card.cardId),
			playerPermits
		)
		if (validation) {
			dispatchToast(invalidDeckToast)
			return
		}
		localStorage.setItem(
			'currentDeck',
			JSON.stringify([playerDeck.cards.map((card) => card.cardId)])
		)
		dispatch(joinQueue())
	}
	const handleCreatePrivateGame = () => {
		const validation = validateDeck(
			playerDeck.cards.map((card) => card.cardId),
			playerPermits
		)
		if (validation) {
			dispatchToast(invalidDeckToast)
			return
		}
		dispatch(createPrivateGame())
	}
	const handleJoinPrivateGame = () => {
		const validation = validateDeck(
			playerDeck.cards.map((card) => card.cardId),
			playerPermits
		)
		if (validation) {
			dispatchToast(invalidDeckToast)
			return
		}
		dispatch(joinPrivateGame())
	}
	const handleLogOut = () => dispatch(logout())
	const handleDeck = () => setMenuSection('deck')
	const handleSettings = () => setMenuSection('settings')
	const handlePermitOffice = () => setMenuSection('permit-office')

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
					<Button variant="stone" id={css.public} onClick={handleJoinQueue}>
						Public Game
					</Button>
					<Button variant="stone" id={css.privateCreate} onClick={handleCreatePrivateGame}>
						Create Private Game
					</Button>
					<Button variant="stone" id={css.privateJoin} onClick={handleJoinPrivateGame}>
						Join Private Game
					</Button>
					<Button variant="gold" id={css.permitOffice} onClick={handlePermitOffice}>
						Permit Office
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
