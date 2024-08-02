import {getGameState} from 'logic/game/game-selectors'
import {getStatus} from 'logic/matchmaking/matchmaking-selectors'
import {getPlayerName} from 'logic/session/session-selectors'
import {useSelector} from 'react-redux'

export const useRouter = () => {
	const playerName = useSelector(getPlayerName)
	const matchmakingStatus = useSelector(getStatus)
	const gameState = useSelector(getGameState)

	if (gameState) {
		return 'game'
	} else if (matchmakingStatus) {
		return 'matchmaking'
	} else if (playerName) {
		return 'menu'
	}
	return 'login'
}
