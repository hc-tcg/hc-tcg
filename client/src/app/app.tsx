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

function App() {
	const section = useRouter()
	const dispatch = useDispatch()
	const playerName = useSelector(getPlayerName)
	const socketStatus = useSelector(getSocketStatus)
	const toastMessage = useSelector(getToast)
	const [menuSection, setMenuSection] = useState<string>('mainmenu')

	useEffect(() => {
		dispatch(sectionChange(section))
	}, [section])

	let showToast = false

	const router = () => {
		if (section === 'game') {
			return <Game />
		} else if (section === 'matchmaking') {
			return <MatchMaking />
		} else if (playerName) {
			showToast = true
			switch (menuSection) {
				case 'deck':
					return <Deck setMenuSection={setMenuSection} />
				default:
					return <MainMenu setMenuSection={setMenuSection} />
			}
		}
		return <Login />
	}

	return (
		<main>
			{router()}
			{playerName && !socketStatus ? <LostConnection /> : null}

			{showToast ? (
				<Toast
					title={toastMessage.title}
					description={toastMessage.description}
					image={toastMessage.image}
					setOpen={toastMessage.open}
				/>
			) : null}
		</main>
	)
}

export default App
