import cn from 'classnames'
import {LocalPlayerState} from 'common/types/game-state'
import {
	getGameState,
	getOpponentConnection,
	getPlayerEntity,
} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import {useSelector} from 'react-redux'
import css from './player-info.module.scss'

type Props = {
	player: LocalPlayerState
	direction: 'left' | 'right'
}

function PlayerInfo({player, direction}: Props) {
	const gameState = useSelector(getGameState)
	const playerEntity = useSelector(getPlayerEntity)
	const opponentConnected = useSelector(getOpponentConnection)
	const playerConnected = useSelector(getSocketStatus) === 'connected'
	const settings = useSelector(getSettings)

	if (!gameState) throw new Error('This should not happen')

	const getName = (player: LocalPlayerState) => {
		if (!settings.profanityFilterEnabled) return player.playerName
		return player.censoredPlayerName
	}

	const health = (lives: number) => {
		const hearts = new Array(3).fill(null).map((_, index) => {
			const heartImg =
				lives > index
					? `/images/cosmetics/heart/${player.appearance.heart.id}.png`
					: '/images/game/heart_empty.png'
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

	const connected =
		player.entity === playerEntity ? playerConnected : opponentConnected
	const thisPlayer = gameState.turn.currentPlayerEntity === player.entity
	const headDirection = direction === 'left' ? 'right' : 'left'
	const playerTag = player.appearance.title.name

	const playerStyle = {
		borderImageSource:
			player.appearance.border.id === 'blue'
				? undefined
				: `url(/images/cosmetics/border/${player.appearance.border.id}.png)`,
		backgroundImage:
			player.appearance.background.id === 'transparent'
				? undefined
				: `url(/images/cosmetics/background/${player.appearance.background.id}.png)`,
	}

	return (
		<div
			className={cn(css.playerInfo, css[direction], {[css.active]: thisPlayer})}
			style={playerStyle}
		>
			<img
				className={css.playerHead}
				src={`https://mc-heads.net/head/${player.minecraftName}/${headDirection}`}
				alt="player head"
			/>
			<div className={cn(css.playerName, css[direction])}>
				<h1
					className={cn({
						[css.turnHighlight]:
							thisPlayer && player.appearance.background.id === 'transparent',
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
			<div
				className={cn(css.background, css[direction], {
					[css.active]: thisPlayer,
				})}
				style={{}}
			></div>
		</div>
	)
}

export default PlayerInfo
