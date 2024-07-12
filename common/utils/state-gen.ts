import {DEBUG_CONFIG} from '../config'
import {card} from '../filters'
import {GameModel} from '../models/game-model'
import {PlayerModel} from '../models/player-model'
import {
	BoardSlotComponent,
	CardComponent,
	HandSlotComponent,
	DeckSlotComponent,
	RowComponent,
} from '../types/components'
import ECS from '../types/ecs'
import {GameState, PlayerComponent, PlayerEntity} from '../types/game-state'

export function setupEcs(components: ECS, player1: PlayerModel, player2: PlayerModel) {
	let player1Component = components.new(PlayerComponent, player1)
	let player2Component = components.new(PlayerComponent, player2)

	setupEcsForPlayer(components, player1, player1Component.entity)
	setupEcsForPlayer(components, player2, player2Component.entity)
	components.new(BoardSlotComponent, null, 'single_use', null, null)
}

function setupEcsForPlayer(components: ECS, playerModel: PlayerModel, playerEntity: PlayerEntity) {
	for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
		let row = components.new(RowComponent, playerEntity, rowIndex)

		components.new(BoardSlotComponent, playerEntity, 'item', 0, row.entity)
		components.new(BoardSlotComponent, playerEntity, 'item', 1, row.entity)
		components.new(BoardSlotComponent, playerEntity, 'item', 2, row.entity)
		components.new(BoardSlotComponent, playerEntity, 'attach', 3, row.entity)
		components.new(BoardSlotComponent, playerEntity, 'hermit', 4, row.entity)
	}

	const cards = [...playerModel.deck.cards].sort(() => Math.random() - 0.5)

	for (const card of cards) {
		const cardInstance = components.new(CardComponent, card.props.id, playerEntity)
		cardInstance.slotEntity = components.new(DeckSlotComponent, playerEntity).entity
	}

	const pack = components.filter(CardComponent, card.player(playerEntity))

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
		pack[i].slotEntity = components.new(HandSlotComponent, playerEntity).entity
	}
}

export function getGameState(game: GameModel): GameState {
	const playerEntities = game.components
		.filter(PlayerComponent)
		.map((x) => x.entity)
		.sort(() => Math.random())

	const gameState: GameState = {
		turn: {
			turnNumber: 0,
			currentPlayerEntity: playerEntities[0],
			availableActions: [],
			opponentAvailableActions: [],
			completedActions: [],
			blockedActions: {},
			currentAttack: null,
		},
		order: playerEntities,
		lastActionResult: null,

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
