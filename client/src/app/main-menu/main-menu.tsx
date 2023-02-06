import {useSelector, useDispatch} from 'react-redux'
import {getPlayerName} from 'logic/session/session-selectors'
import {
	randomMatchmaking,
	createPrivateGame,
	joinPrivateGame,
} from 'logic/matchmaking/matchmaking-actions'
import css from './main-menu.module.css'
import {logout} from 'logic/session/session-actions'

function MainMenu() {
	const dispatch = useDispatch()
	const playerName = useSelector(getPlayerName)

	const handleRandomMatchmaking = () => dispatch(randomMatchmaking())
	const handleCreatePrivateGame = () => dispatch(createPrivateGame())
	const handleJoinPrivateGame = () => dispatch(joinPrivateGame())
	const handleLogOut = () => dispatch(logout())

	return (
		<div className={css.chooseGame}>
			<img width="200" height="184" src="/images/tcg1.png" />
			<div className={css.message}>
				Welcome <span className={css.playerName}>{playerName}</span>,
				<br />
				please choose how to find your opponent.
			</div>
			<button onClick={handleRandomMatchmaking}>Random matchmaking</button>
			<button onClick={handleCreatePrivateGame}>Create private game</button>
			<button onClick={handleJoinPrivateGame}>Join private game</button>
			<button onClick={handleLogOut}>Log Out</button>
		</div>
	)
}

export default MainMenu
