import {CARDS} from '../cards'
import {DEBUG_CONFIG} from '../config'
import {card, slot} from '../components/query'
import {GameModel} from '../models/game-model'
import {PlayerModel} from '../models/player-model'
import {
	BoardSlotComponent,
	CardComponent,
	HandSlotComponent,
	DeckSlotComponent,
	RowComponent,
	PlayerComponent,
} from '../components'
import ECS from '../types/ecs'
import {GameState, PlayerEntity} from '../types/game-state'

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

	for (const card of playerModel.deck.cards) {
		const cardInstance = components.new(CardComponent, CARDS[card.props.id], playerEntity)
		cardInstance.slotEntity = components.new(DeckSlotComponent, playerEntity, {
			position: 'random',
		}).entity
	}

	// Ensure there is a hermit in the first 5 cards
	const sortedCards = components
		.filter(CardComponent, card.player(playerEntity), card.slot(slot.deck))
		.sort((a, b) => {
			if (!a.slot?.inDeck() || !b.slot?.inDeck()) return 0
			return a.slot.order - b.slot.order
		})

	let index = sortedCards.findIndex((card) => card.isHermit())

	if (index > 5) {
		let a = sortedCards[index]
		let b = sortedCards[Math.floor(Math.random() * 5)]

		if (a.slot?.inDeck() && b.slot?.inDeck()) {
			let tmp = b.slot.order
			a.slot.order = b.slot.order
			b.slot.order = tmp
		}
	}

	const amountOfStartingCards =
		DEBUG_CONFIG.startWithAllCards || DEBUG_CONFIG.unlimitedCards ? sortedCards.length : 7

	for (let i = 0; i < amountOfStartingCards && i < sortedCards.length; i++) {
		sortedCards[i].slotEntity = components.new(HandSlotComponent, playerEntity).entity
	}
}

export function getGameState(game: GameModel): GameState {
	const playerEntities = game.components.filter(PlayerComponent).sort(() => Math.random())

	const gameState: GameState = {
		turn: {
			turnNumber: 0,
			currentPlayerId: playerEntities[0].id,
			currentPlayerEntity: playerEntities[0].entity,
			availableActions: [],
			opponentAvailableActions: [],
			completedActions: [],
			blockedActions: {},
			currentAttack: null,
		},
		order: playerEntities.map((x) => x.entity),
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
