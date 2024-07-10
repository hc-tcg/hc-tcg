import {getPlayerState} from '../../server/src/utils/state-gen'
import {GameModel} from '../models/game-model'
import {RowInfo, SlotInfo} from '../types/cards'
import {GameState, PlayerId, RowId, SlotId, newInstanceId} from '../types/game-state'

export function buildSlotsForPlayer(game: GameModel, playerId: PlayerId) {
	let slots: Record<SlotId, SlotInfo> = {}
	let rows: Record<RowId, RowInfo> = {}

	for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
		const rowId = newInstanceId() as RowId

		const hermitSlotId = newInstanceId() as SlotId
		const attachSlotId = newInstanceId() as SlotId
		const itemIds = [
			newInstanceId() as SlotId,
			newInstanceId() as SlotId,
			newInstanceId() as SlotId,
		]

		rows[rowId] = new RowInfo(game, rowIndex, hermitSlotId, attachSlotId, itemIds as any)
		slots[itemIds[0]] = new SlotInfo(game, playerId, 'item', 0, rowId, null)
		slots[itemIds[1]] = new SlotInfo(game, playerId, 'item', 1, rowId, null)
		slots[itemIds[2]] = new SlotInfo(game, playerId, 'item', 2, rowId, null)
		slots[attachSlotId] = new SlotInfo(game, playerId, 'attach', 3, rowId, null)
		slots[hermitSlotId] = new SlotInfo(game, playerId, 'hermit', 4, rowId, null)
	}

	return [slots, rows]
}

export function getGameState(game: GameModel): GameState {
	const playerIds = game.getPlayerIds()
	if (Math.random() > 0.5) playerIds.reverse()

	const [playerOneSlots, playerOneRows] = buildSlotsForPlayer(game, playerIds[0])
	const [playerTwoSlots, playerTwoRows] = buildSlotsForPlayer(game, playerIds[1])

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
		slots: {...playerOneSlots, ...playerTwoSlots},
		rows: {...playerOneRows, ...playerTwoRows},
		cards: {},
		statusEffects: {},
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
