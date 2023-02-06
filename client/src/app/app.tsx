import {useSelector, useDispatch} from 'react-redux'
import {getPlayerName} from 'logic/session/session-selectors'
import {getGameState} from 'logic/game/game-selectors'
import {getStatus} from 'logic/matchmaking/matchmaking-selectors'
import LostConnection from 'components/lost-connection'
import Login from './login'
import MainMenu from './main-menu'
import Game from './game'
import MatchMaking from './match-making'
import css from './app.module.css'

function App() {
	const dispatch = useDispatch()
	const playerName = useSelector(getPlayerName)
	const matchmakingStatus = useSelector(getStatus)
	const gameState = useSelector(getGameState)

	const router = () => {
		if (gameState) {
			return <Game />
		} else if (matchmakingStatus) {
			return <MatchMaking />
		} else if (playerName) {
			return <MainMenu />
		}
		return <Login />
	}

	return (
		<main>
			<div className={css.form}>{router()}</div>
			{/* <LostConnection /> */}
		</main>
	)
}

export default App
