import {getEXBossState, getPlayerState} from '../../server/src/utils/state-gen'
import {BossModel} from '../models/boss-model'
import {GameModel} from '../models/game-model'
import {GameState} from '../types/game-state'

export function getGameState(game: GameModel): GameState {
	const playerIds = game.getPlayerIds()
	if (Math.random() > 0.5) playerIds.reverse()

	const gameState: GameState = {
		turn: {
			turnNumber: 0,
			currentPlayerId: playerIds[0],
			availableActions: [],
			opponentAvailableActions: [],
			completedActions: [],
			blockedActions: {},
			currentAttack: null,
		},
		order: playerIds,
		ailments: [],
		lastActionResult: null,
		players: playerIds.reduce(
			(playerStates, playerId) => ({
				...playerStates,
				[playerId]: getPlayerState(game.players[playerId]),
			}),
			{}
		),

		pickRequests: [],
		modalRequests: [],

		timer: {
			turnStartTime: 0,
			turnRemaining: 0,
			opponentActionStartTime: null,
		},
	}
	return gameState
}

export function getBossState(game: BossModel): GameState {
	const playerIds = game.getPlayerIds()

	const challengerState = getPlayerState(game.players[playerIds[0]])
	// Limit challenging player to 3 rows in play at once
	challengerState.board.rows = challengerState.board.rows.slice(0, 3)

	const gameState: GameState = {
		turn: {
			turnNumber: 0,
			currentPlayerId: playerIds[0],
			availableActions: [],
			opponentAvailableActions: [],
			completedActions: [],
			blockedActions: {},
			currentAttack: null,
		},
		order: playerIds,
		ailments: [],
		lastActionResult: null,
		players: {
			[playerIds[0]]: challengerState,
			[playerIds[1]]: getEXBossState(game.players[playerIds[1]]),
		},

		pickRequests: [],
		modalRequests: [],

		timer: {
			turnStartTime: 0,
			turnRemaining: 0,
			opponentActionStartTime: null,
		},
	}
	return gameState
}
