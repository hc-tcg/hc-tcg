import {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import LostConnection from 'components/lost-connection'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import {getPlayerName} from 'logic/session/session-selectors'
import {sectionChange} from 'logic/sound/sound-actions'
import {useRouter} from './app-hooks'
import Login from './login'
import MainMenu from './main-menu'
import Game from './game'
import Deck from './deck'
import MatchMaking from './match-making'

function App() {
	const section = useRouter()
	const dispatch = useDispatch()
	const playerName = useSelector(getPlayerName)
	const socketStatus = useSelector(getSocketStatus)
	const [menuSection, setMenuSection] = useState<string>('mainmenu')

	useEffect(() => {
		dispatch(sectionChange(section))
	}, [section])

	const router = () => {
		if (section === 'game') {
			return <Game />
		} else if (section === 'matchmaking') {
			return <MatchMaking />
		} else if (section === 'menu') {
			return menuSection === 'deck' ? (
				<Deck setMenuSection={setMenuSection} />
			) : (
				<MainMenu setMenuSection={setMenuSection} />
			)
		}
		return <Login />
	}

	return (
		<main>
			{router()}
			{playerName && !socketStatus ? <LostConnection /> : null}
		</main>
	)
}

export default App
