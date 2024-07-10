import {getPlayerState} from '../../server/src/utils/state-gen'
import {GameModel} from '../models/game-model'
import {RowInfo, SlotInfo} from '../types/cards'
import {EntityList} from '../types/entity-list'
import {CardInstance, GameState, PlayerId} from '../types/game-state'

export function setupGameStateForPlayer(game: GameModel, gameState: GameState, playerId: PlayerId) {
	for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
		let row = new RowInfo(game, rowIndex)
		gameState.rows.add(row)

		gameState.slots.add(new SlotInfo(game, playerId, 'item', 0, row.id))
		gameState.slots.add(new SlotInfo(game, playerId, 'item', 1, row.id))
		gameState.slots.add(new SlotInfo(game, playerId, 'item', 2, row.id))
		gameState.slots.add(new SlotInfo(game, playerId, 'attach', 3, row.id))
		gameState.slots.add(new SlotInfo(game, playerId, 'hermit', 4, row.id))
	}

	for (const card of game.players[playerId].deck.cards) {
		gameState.cards.add(new CardInstance(game, card))
	}
}

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
		/* Global objects for the game state. Do NOT remove objects from these dictionaries. */
		slots: new EntityList(game),
		rows: new EntityList(game),
		cards: new EntityList(game),
		statusEffects: new EntityList(game),
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

	setupGameStateForPlayer(game, gameState, playerIds[0])
	setupGameStateForPlayer(game, gameState, playerIds[1])

	gameState.slots.add(new SlotInfo(game, null, 'single_use', null, null))

	return gameState
}
