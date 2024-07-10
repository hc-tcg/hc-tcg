import {getPlayerState} from '../../server/src/utils/state-gen'
import {DEBUG_CONFIG} from '../config'
import {card} from '../filters'
import {GameModel} from '../models/game-model'
import {BoardSlotInfo, HandSlotInfo, PileSlotInfo, RowInfo} from '../types/cards'
import {EntityList} from '../types/entity-list'
import {CardInstance, GameState, PlayerId} from '../types/game-state'

export function setupGameStateForPlayer(game: GameModel, gameState: GameState, playerId: PlayerId) {
	for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
		let rowId = gameState.rows.add(new RowInfo(game, playerId, rowIndex))

		gameState.slots.add(new BoardSlotInfo(game, playerId, 'item', 0, rowId))
		gameState.slots.add(new BoardSlotInfo(game, playerId, 'item', 1, rowId))
		gameState.slots.add(new BoardSlotInfo(game, playerId, 'item', 2, rowId))
		gameState.slots.add(new BoardSlotInfo(game, playerId, 'attach', 3, rowId))
		gameState.slots.add(new BoardSlotInfo(game, playerId, 'hermit', 4, rowId))
	}

	let cards = [...game.players[playerId].deck.cards]

	cards.sort(() => Math.random() - 0.5)

	for (const card of cards) {
		let cardInstance = new CardInstance(game, card, playerId)
		gameState.cards.add(cardInstance)
		cardInstance.slotId = gameState.slots.add(new PileSlotInfo(game, playerId))
	}

	const pack = gameState.cards.filter(card.player(playerId))

	// ensure a hermit in first 5 cards
	const hermitIndex = pack.findIndex((card) => {
		return card.props.category === 'hermit'
	})
	if (hermitIndex > 5) {
		;[pack[0], pack[hermitIndex]] = [pack[hermitIndex], pack[0]]
	}

	const amountOfStartingCards =
		DEBUG_CONFIG.startWithAllCards || DEBUG_CONFIG.unlimitedCards ? pack.length : 7

	for (let i = 0; i < amountOfStartingCards && i < pack.length; i++) {
		pack[i].slotId = gameState.slots.add(new HandSlotInfo(game, playerId))
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
				[playerId]: getPlayerState(game, game.players[playerId]),
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

	gameState.slots.add(new BoardSlotInfo(game, null, 'single_use', null, null))

	return gameState
}
