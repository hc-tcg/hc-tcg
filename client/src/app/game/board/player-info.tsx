import {useSelector} from 'react-redux'
import classnames from 'classnames'
import HealthBar from 'components/health-bar'
import {PlayerState} from 'types/game-state'
import css from './board.module.css'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import {getPlayerId} from 'logic/session/session-selectors'
import {getGameState, getOppopnentConnection} from 'logic/game/game-selectors'

type Props = {
	player: PlayerState
	dir: 'left' | 'right'
}

function PlayerInfo({player, dir}: Props) {
	const gameState = useSelector(getGameState)
	const playerId = useSelector(getPlayerId)
	const opponentConnected = useSelector(getOppopnentConnection)
	const playerConnected = useSelector(getSocketStatus) === 'connected'
	const settings = useSelector(getSettings)

	if (!gameState) throw new Error('This sould not happen')

	const getName = (player: PlayerState) => {
		if (settings.profanityFilter === 'off') return player.playerName
		return player.censoredPlayerName
	}

	const connected = player.id === playerId ? playerConnected : opponentConnected
	const connClass = connected ? 'connected' : 'disconnected'

	return (
		<div className={classnames(css.playerInfo, css[dir])}>
			<div className={classnames(css.playerName, css[connClass])}>
				{getName(player)}
			</div>
			{gameState.turnPlayerId === player.id ? (
				<div className={css.currentTurn}>
					{gameState.turnPlayerId === playerId
						? 'Your turn'
						: "Opponent's turn"}
				</div>
			) : null}
			<div className={css.dynamicSpace} />
			<HealthBar lives={player.lives} />
		</div>
	)
}

export default PlayerInfo
