import {getPlayerState} from '../../server/src/utils/state-gen'
import {DEBUG_CONFIG} from '../config'
import {card} from '../filters'
import {GameModel} from '../models/game-model'
import {
	BoardSlotComponent,
	CardComponent,
	HandSlotComponent,
	PileSlotComponent,
	RowComponent,
} from '../types/components'
import {ComponentList} from '../types/component-list'
import {GameState, PlayerId} from '../types/game-state'

export function setupGameStateForPlayer(game: GameModel, gameState: GameState, playerId: PlayerId) {
	for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
		let row = gameState.rows.new(RowComponent, playerId, rowIndex)

		gameState.slots.new(BoardSlotComponent, playerId, 'item', 0, row.entity)
		gameState.slots.new(BoardSlotComponent, playerId, 'item', 1, row.entity)
		gameState.slots.new(BoardSlotComponent, playerId, 'item', 2, row.entity)
		gameState.slots.new(BoardSlotComponent, playerId, 'attach', 3, row.entity)
		gameState.slots.new(BoardSlotComponent, playerId, 'hermit', 4, row.entity)
	}

	let cards = [...game.players[playerId].deck.cards]

	cards.sort(() => Math.random() - 0.5)

	for (const card of cards) {
		const cardInstance = gameState.cards.new(CardComponent, card.props.id, playerId)
		cardInstance.slotEntity = gameState.slots.new(PileSlotComponent, playerId).entity
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
		pack[i].slotEntity = gameState.slots.new(HandSlotComponent, playerId).entity
	}
}

export function getGameState(game: GameModel): GameState {
	const playerIds = game.getPlayerIds()
	if (Math.random() > 0.5) playerIds.reverse()

	const ecs = new ComponentList(game)

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
		slots: new ComponentList(game),
		rows: new ComponentList(game),
		cards: new ComponentList(game),
		statusEffects: new ComponentList(game),
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

	gameState.slots.new(BoardSlotComponent, null, 'single_use', null, null)

	return gameState
}
