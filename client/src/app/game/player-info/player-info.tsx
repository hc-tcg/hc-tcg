import {useSelector} from 'react-redux'
import css from './player-info.module.scss'
import cn from 'classnames'
import {LocalPlayerState} from 'common/types/game-state'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import {getPlayerId} from 'logic/session/session-selectors'
import {getGameState, getOpponentConnection} from 'logic/game/game-selectors'

type Props = {
	player: LocalPlayerState
	direction: 'left' | 'right'
}

function PlayerInfo({player, direction}: Props) {
	const gameState = useSelector(getGameState)
	const playerId = useSelector(getPlayerId)
	const opponentConnected = useSelector(getOpponentConnection)
	const playerConnected = useSelector(getSocketStatus) === 'connected'
	const settings = useSelector(getSettings)

	if (!gameState) throw new Error('This should not happen')

	const getName = (player: LocalPlayerState) => {
		if (settings.profanityFilter === 'off') return player.playerName
		return player.censoredPlayerName
	}

	const health = (lives: number) => {
		const hearts = new Array(3).fill(null).map((_, index) => {
			const heartImg =
				lives > index
					? 'images/game/heart_full.png'
					: 'images/game/heart_empty.png'
			return (
				<img
					key={index}
					className={css.heart}
					src={heartImg}
					width="32"
					height="32"
				/>
			)
		})
		return hearts
	}

	const connected = player.id === playerId ? playerConnected : opponentConnected
	const thisPlayer = gameState.currentPlayerId === player.id
	const headDirection = direction === 'left' ? 'right' : 'left'
	const playerTag = '' // TODO: Implement player tags...
	// Player tags ideally would be a list of predetermined phrases
	// or attack moves that users would select from the main menu.

	return (
		<div
			className={cn(css.playerInfo, css[direction], {[css.active]: thisPlayer})}
		>
			<img
				className={css.playerHead}
				src={`https://mc-heads.net/head/${player.playerName}/${headDirection}`}
				alt="player head"
			/>
			<div className={cn(css.playerName, css[direction])}>
				<h1
					className={cn({
						[css.turnHighlight]: thisPlayer,
						[css.disconnected]: !connected,
					})}
				>
					{getName(player)}
				</h1>
				<p className={css.tag}>
					{!connected ? 'Player Disconnected' : playerTag}
				</p>
			</div>

			<div className={cn(css.health, css[direction])}>
				{health(player.lives)}
			</div>
		</div>
	)
}

export default PlayerInfo
