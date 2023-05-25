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

	// const randomAbilities = Object.entries(HERMIT_CARDS)
	// 	.map(([key]) => HERMIT_CARDS[key].primary.name)
	// 	.concat(
	// 		Object.entries(HERMIT_CARDS).map(
	// 			([key]) => HERMIT_CARDS[key].secondary.name
	// 		)
	// 	)

	// const randomAbility =
	// 	randomAbilities[Math.floor(Math.random() * randomAbilities.length)]

	const connected = player.id === playerId ? playerConnected : opponentConnected
	const thisPlayer = gameState.currentPlayerId === player.id
	const headDirection = direction === 'left' ? 'right' : 'left'

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
					{!connected ? 'Player Disconnected' : 'Chuffed to Bits'}
				</p>
			</div>

			<div className={cn(css.health, css[direction])}>
				{health(player.lives)}
			</div>
		</div>
	)
}

export default PlayerInfo
