import {DEBUG_CONFIG} from '../config'
import query from '../components/query'
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
import ComponentTable from '../types/ecs'
import {GameState} from '../types/game-state'
import {PlayerEntity} from '../entities'

/* Set up the components that will be referenced during the game. This includes:
 * - The player objects
 * - Board Slot
 * - Cards in the deck and hand
 */
export function setupComponents(
	components: ComponentTable,
	player1: PlayerModel,
	player2: PlayerModel
) {
	let player1Component = components.new(PlayerComponent, player1)
	let player2Component = components.new(PlayerComponent, player2)

	setupEcsForPlayer(components, player1, player1Component.entity)
	setupEcsForPlayer(components, player2, player2Component.entity)
	components.new(BoardSlotComponent, {type: 'single_use'}, null, null)
}

function setupEcsForPlayer(
	components: ComponentTable,
	playerModel: PlayerModel,
	playerEntity: PlayerEntity
) {
	for (const card of playerModel.deck.cards) {
		let slot = components.new(DeckSlotComponent, playerEntity, {
			position: 'random',
		})
		components.new(CardComponent, card.props.numericId, slot.entity)
	}

	for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
		let row = components.new(RowComponent, playerEntity, rowIndex)

		components.new(BoardSlotComponent, {player: playerEntity, type: 'item'}, 0, row.entity)
		components.new(BoardSlotComponent, {player: playerEntity, type: 'item'}, 1, row.entity)
		components.new(BoardSlotComponent, {player: playerEntity, type: 'item'}, 2, row.entity)
		components.new(BoardSlotComponent, {player: playerEntity, type: 'attach'}, 3, row.entity)
		components.new(BoardSlotComponent, {player: playerEntity, type: 'hermit'}, 4, row.entity)
	}

	// Ensure there is a hermit in the first 5 cards
	const sortedCards = components
		.filter(CardComponent, query.card.player(playerEntity), query.card.slot(query.slot.deck))
		.sort(CardComponent.compareOrder)

	let index = sortedCards.findIndex((card) => card.isHermit())

	if (index > 5) {
		let a = sortedCards[index]
		const swapIndex = Math.floor(Math.random() * 5)
		let b = sortedCards[swapIndex]

		if (a.slot?.inDeck() && b.slot?.inDeck()) {
			let tmp = b.slot.order
			a.slot.order = b.slot.order
			b.slot.order = tmp
			let tmpCard = sortedCards[index]
			sortedCards[index] = sortedCards[swapIndex]
			sortedCards[swapIndex] = tmpCard
		}
	}

	const amountOfStartingCards =
		DEBUG_CONFIG.startWithAllCards || DEBUG_CONFIG.unlimitedCards ? sortedCards.length : 7

	for (let i = 0; i < DEBUG_CONFIG.extraStartingCards.length; i++) {
		const id = DEBUG_CONFIG.extraStartingCards[i]
		let slot = components.new(HandSlotComponent, playerEntity)
		components.new(CardComponent, id, slot.entity)
	}

	sortedCards.slice(0, amountOfStartingCards).forEach((card) => {
		card.attach(components.new(HandSlotComponent, playerEntity))
	})
}

export function getGameState(game: GameModel): GameState {
	const playerEntities = game.components.filter(PlayerComponent)

	if (Math.random() >= 0.5) {
		playerEntities.reverse()
	}

	const gameState: GameState = {
		turn: {
			turnNumber: 0,
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
