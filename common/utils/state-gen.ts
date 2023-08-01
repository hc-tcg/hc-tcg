import {getPlayerState} from '../../server/src/utils/state-gen'
import {GameModel} from '../models/game-model'
import {GameState} from '../types/game-state'

export function getGameState(game: GameModel): GameState {
	const playerIds = game.getPlayerIds()
	if (Math.random() > 0.5) playerIds.reverse()

	/** @type {GameState} */
	const gameState: GameState = {
		turn: 0,
		order: playerIds,
		turnPlayerId: playerIds[0],
		players: playerIds.reduce(
			(playerStates, playerId) => ({
				...playerStates,
				[playerId]: getPlayerState(game.players[playerId]),
			}),
			{}
		),

		timer: {
			turnTime: 0,
			turnRemaining: 0,
		},
	}
	return gameState
}
