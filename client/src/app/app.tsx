import {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getPlayerName, getToast} from 'logic/session/session-selectors'
import LostConnection from 'components/lost-connection'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import {sectionChange} from 'logic/sound/sound-actions'
import {useRouter} from './app-hooks'
import Login from './login'
import Game from './game'
import MainMenu from './main-menu'
import Deck from './deck'
import MatchMaking from './match-making'
import Toast from 'components/toast'
import Settings from './main-menu/settings'

function App() {
	const section = useRouter()
	const dispatch = useDispatch()
	const playerName = useSelector(getPlayerName)
	const socketStatus = useSelector(getSocketStatus)
	const toastMessage = useSelector(getToast)
	const [menuSection, setMenuSection] = useState<string>('mainmenu')
	let enableToast = false

	useEffect(() => {
		dispatch(sectionChange(section))
	}, [section])

	const router = () => {
		if (section === 'game') {
			return <Game />
		} else if (section === 'matchmaking') {
			return <MatchMaking />
		} else if (playerName) {
			enableToast = true
			switch (menuSection) {
				case 'deck':
					return <Deck setMenuSection={setMenuSection} />
				case 'settings':
					return <Settings setMenuSection={setMenuSection} />
				case 'mainmenu':
				default:
					return <MainMenu setMenuSection={setMenuSection} />
			}
		}
		return <Login />
	}

	return (
		<main>
			{router()}
			{playerName && !socketStatus && <LostConnection />}
			{enableToast && (
				<Toast
					title={toastMessage.title}
					description={toastMessage.description}
					image={toastMessage.image}
					setOpen={toastMessage.open}
				/>
			)}
		</main>
	)
}

export default App
