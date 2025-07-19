import cn from 'classnames'
import {PlayerEntity} from 'common/entities'
import {LocalPlayerState} from 'common/types/game-state'
import Spinner from 'components/spinner'
import {
	getGameState,
	getOpponentConnection,
	getPlayerEntity,
	getPlayerStateByEntity,
} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import {useSelector} from 'react-redux'
import css from './player-info.module.scss'

type Props = {
	playerEntity: PlayerEntity
	direction: 'left' | 'right'
}

function PlayerInfo({playerEntity, direction}: Props) {
	const gameState = useSelector(getGameState)
	const player = useSelector(getPlayerStateByEntity(playerEntity))
	const watchingPlayerEntity = useSelector(getPlayerEntity)
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
		playerEntity === watchingPlayerEntity ? playerConnected : opponentConnected
	const thisPlayer = gameState.turn.currentPlayerEntity === playerEntity
	const headDirection = direction === 'left' ? 'right' : 'left'
	const playerTag =
		player.appearance.title.id === 'no_title'
			? ''
			: player.appearance.title.name

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
			<div
				className={cn(
					css.playerName,
					css[direction],
					!connected && css.disconnected,
				)}
			>
				<h1
					className={cn({
						[css.turnHighlight]:
							thisPlayer && player.appearance.background.id === 'transparent',
						[css.disconnected]: !connected,
					})}
				>
					{getName(player)}
				</h1>
				<p className={css.tag}>{playerTag}</p>
			</div>
			{!connected && (
				<div className={css.disconnectedComponent}>
					<Spinner></Spinner>
					Player Disconnected
				</div>
			)}

			<div className={cn(css.health, css[direction])}>
				{health(player.lives)}
			</div>
			<div
				className={cn(css.background, css[direction], {
					[css.active]: thisPlayer,
					[css.disconnected]: !connected,
				})}
				style={{}}
			></div>
		</div>
	)
}

export default PlayerInfo
