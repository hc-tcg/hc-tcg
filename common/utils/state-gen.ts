import {Card} from '../cards/base/types'
import {
	BoardSlotComponent,
	CardComponent,
	DeckSlotComponent,
	HandSlotComponent,
	PlayerComponent,
	RowComponent,
} from '../components'
import {PlayerDefs} from '../components/player-component'
import query from '../components/query'
import {PlayerEntity} from '../entities'
import {GameModel} from '../models/game-model'
import ComponentTable from '../types/ecs'
import {GameState} from '../types/game-state'

export type PlayerSetupDefs = {
	model: PlayerDefs
	deck: Array<number | string | Card>
}

type ComponentSetupOptions = {
	shuffleDeck: boolean
	startWithAllCards: boolean
	unlimitedCards: boolean
	extraStartingCards: Array<string>
}

/* Set up the components that will be referenced during the game. This includes:
 * - The player objects
 * - Board Slot
 * - Cards in the deck and hand
 */
export function setupComponents(
	components: ComponentTable,
	player1: PlayerSetupDefs,
	player2: PlayerSetupDefs,
	options: ComponentSetupOptions,
) {
	let player1Component = components.new(PlayerComponent, player1.model)
	let player2Component = components.new(PlayerComponent, player2.model)

	setupEcsForPlayer(components, player1Component.entity, player1.deck, options)
	setupEcsForPlayer(components, player2Component.entity, player2.deck, options)
	components.new(BoardSlotComponent, {type: 'single_use'}, null, null)
}

function setupEcsForPlayer(
	components: ComponentTable,
	playerEntity: PlayerEntity,
	deck: Array<number | string | Card>,
	options: ComponentSetupOptions,
) {
	for (const card of deck) {
		let slot = components.new(DeckSlotComponent, playerEntity, {
			position: options.shuffleDeck ? 'random' : 'back',
		})
		components.new(CardComponent, card, slot.entity)
	}

	for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
		let row = components.new(RowComponent, playerEntity, rowIndex)

		components.new(
			BoardSlotComponent,
			{player: playerEntity, type: 'item'},
			0,
			row.entity,
		)
		components.new(
			BoardSlotComponent,
			{player: playerEntity, type: 'item'},
			1,
			row.entity,
		)
		components.new(
			BoardSlotComponent,
			{player: playerEntity, type: 'item'},
			2,
			row.entity,
		)
		components.new(
			BoardSlotComponent,
			{player: playerEntity, type: 'attach'},
			3,
			row.entity,
		)
		components.new(
			BoardSlotComponent,
			{player: playerEntity, type: 'hermit'},
			4,
			row.entity,
		)
	}

	// Ensure there is a hermit in the first 5 cards
	const sortedCards = components
		.filter(
			CardComponent,
			query.card.player(playerEntity),
			query.card.slot(query.slot.deck),
		)
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
		options.startWithAllCards || options.unlimitedCards ? sortedCards.length : 7

	for (let i = 0; i < options.extraStartingCards.length; i++) {
		const id = options.extraStartingCards[i]
		let slot = components.new(HandSlotComponent, playerEntity)
		components.new(CardComponent, id, slot.entity)
	}

	sortedCards.slice(0, amountOfStartingCards).forEach((card) => {
		card.attach(components.new(HandSlotComponent, playerEntity))
	})
}

export function getGameState(
	game: GameModel,
	randomizeOrder: boolean = true,
): GameState {
	const playerEntities = game.components.filter(PlayerComponent)

	if (randomizeOrder !== false) {
		if (Math.random() >= 0.5) {
			playerEntities.reverse()
		}
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

		pickRequests: [],
		modalRequests: [],
		soundEffects: [],

		timer: {
			turnStartTime: 0,
			turnRemaining: 0,
			opponentActionStartTime: null,
		},
	}

	return gameState
}
