import {CARDS} from '../cards'
import {Card} from '../cards/types'
import {
	BoardSlotComponent,
	CardComponent,
	DeckSlotComponent,
	HandSlotComponent,
	PlayerComponent,
	RowComponent,
} from '../components'
import {unknownCard} from '../components/card-component'
import {PlayerDefs} from '../components/player-component'
import query from '../components/query'
import {UnknownDeckSlotComponent} from '../components/slot-component'
import {CardEntity, PlayerEntity} from '../entities'
import {GameModel} from '../models/game-model'
import {Deck} from '../types/deck'
import ComponentTable from '../types/ecs'
import {GameState} from '../types/game-state'
import {VirtualAI} from '../types/virtual-ai'
import {assert} from '../utils/assert'
import {fisherYatesShuffle} from '../utils/fisher-yates'

export type PlayerDeck =
	| {
			// This game knows the entire deck. This is used on the server.
			type: 'visible'
			cards: Array<number | string>
	  }
	| {
			// On both clients we need to hide parts of the deck to prevent cheating.
			// There should be sent in the shuffled order
			type: 'hidden'
			initialHand?: Array<string>
			entities: Array<CardEntity>
	  }

export type PlayerSetupDefs = {
	model: PlayerDefs
	deck: PlayerDeck
	score: number
	ai?: string
}

type ComponentSetupOptions = {
	shuffleDeck: boolean
	startWithAllCards: boolean
	unlimitedCards: boolean
	extraStartingCards: Array<string>
}

export type OpponentDefs = PlayerDefs & {
	deck: Array<number | string | Card>
	virtualAI: VirtualAI
}

export function getDeckSize(deck: PlayerDeck): number {
	if (deck.type === 'hidden') {
		return deck.entities.length
	}
	return deck.cards.length
}

/* Set up the components that will be referenced during the game. This includes:
 * - The player objects
 * - Board Slot
 * - Cards in the deck and hand
 */
export function setupComponents(
	game: GameModel,
	components: ComponentTable,
	player1: PlayerSetupDefs,
	player2: PlayerSetupDefs,
	options: ComponentSetupOptions,
) {
	let player1Component = components.new(
		PlayerComponent,
		player1.model,
		getDeckSize(player1.deck),
	)
	let player2Component = components.new(
		PlayerComponent,
		player2.model,
		getDeckSize(player1.deck),
	)

	game.playerOne = player1Component.entity
	game.playerTwo = player2Component.entity

	setupEcsForPlayer(
		game,
		components,
		player1Component.entity,
		player1.deck,
		options,
	)
	setupEcsForPlayer(
		game,
		components,
		player2Component.entity,
		player2.deck,
		options,
	)
	components.new(BoardSlotComponent, {type: 'single_use'}, null, null)
}

function setupBoard(components: ComponentTable, playerEntity: PlayerEntity) {
	for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
		let row = components.new(RowComponent, playerEntity, rowIndex)

		let itemSlots = [
			components.new(
				BoardSlotComponent,
				{player: playerEntity, type: 'item'},
				0,
				row.entity,
			),
			components.new(
				BoardSlotComponent,
				{player: playerEntity, type: 'item'},
				1,
				row.entity,
			),
			components.new(
				BoardSlotComponent,
				{player: playerEntity, type: 'item'},
				2,
				row.entity,
			),
		]
		let attachSlot = components.new(
			BoardSlotComponent,
			{player: playerEntity, type: 'attach'},
			3,
			row.entity,
		)
		let hermitSlot = components.new(
			BoardSlotComponent,
			{player: playerEntity, type: 'hermit'},
			4,
			row.entity,
		)

		row.itemsSlotEntities = itemSlots.map((x) => x.entity)
		row.hermitSlotEntity = hermitSlot.entity
		row.attachSlotEntity = attachSlot.entity
	}
}

function setupDeck(
	game: GameModel,
	components: ComponentTable,
	playerEntity: PlayerEntity,
	deck: PlayerDeck,
	options: ComponentSetupOptions,
) {
	if (deck.type === 'hidden') {
		for (let i = 0; i < getDeckSize(deck); i++) {
			let slot = components.new(DeckSlotComponent, playerEntity, {
				position: 'back',
			})
			components.new(CardComponent, unknownCard, slot.entity)
		}

		deck.entities.forEach((entity, i) => {
			const card = components.getOrError(entity)
			const slot = card.slot
			assert(slot.inDeck())
			slot.order = i
		})

		const initialHand = game.components
			.filter(CardComponent, query.card.player(playerEntity))
			.sort(CardComponent.compareOrder)
			.slice(deck.initialHand.length)

		deck.initialHand.forEach((card, i) => {
			// Players additionally know each card in their initial hand.
			if (initialHand) {
				initialHand[i].props = CARDS[card]
			}

			// We always put the player's cards in their hand.
			initialHand[i].attach(components.new(HandSlotComponent, playerEntity))
		})
	} else {
		for (let i = 0; i < getDeckSize(deck); i++) {
			const slot = components.new(UnknownDeckSlotComponent, playerEntity)
			components.new(CardComponent, unknownCard, slot.entity)
		}
		game.components.get(playerEntity)!.deckIsUnkown = true

		const cards = components.filter(
			CardComponent,
			query.card.player(playerEntity),
			query.card.slot(query.slot.deck),
		)

		const amountOfStartingCards =
			options.startWithAllCards || options.unlimitedCards ? cards.length : 7

		for (let i = 0; i < options.extraStartingCards.length; i++) {
			const id = options.extraStartingCards[i]
			let slot = components.new(HandSlotComponent, playerEntity)
			components.new(CardComponent, id, slot.entity)
		}

		// Ensure there is a hermit in the first 5 cards
		if (options.shuffleDeck) {
			fisherYatesShuffle(cards, game.usePlayerShuffleRNG(playerEntity)).forEach(
				(card, i) => {
					if (card.slot.inDeck()) card.slot.order = i
				},
			)

			if (!cards.some((card) => card.isHermit())) return

			while (
				!cards.slice(0, amountOfStartingCards).some((card) => card.isHermit())
			) {
				fisherYatesShuffle(
					cards,
					game.usePlayerShuffleRNG(playerEntity),
				).forEach((card, i) => {
					if (card.slot.inDeck()) card.slot.order = i
				})
			}
		}

		cards.slice(0, amountOfStartingCards).forEach((card) => {
			card.attach(components.new(HandSlotComponent, playerEntity))
		})
	}
}

function setupEcsForPlayer(
	game: GameModel,
	components: ComponentTable,
	playerEntity: PlayerEntity,
	deck: PlayerDeck,
	options: ComponentSetupOptions,
) {
	setupBoard(components, playerEntity)
	setupDeck(game, components, playerEntity, deck, options)
}

export function getGameState(game: GameModel, swapPlayers: boolean): GameState {
	const playerEntities = game.components.filter(PlayerComponent)

	if (swapPlayers !== false) {
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

		pickRequests: [],
		modalRequests: [],

		timer: {
			turnStartTime: 0,
			turnRemaining: 0,
			opponentActionStartTime: null,
		},

		isEvilXBossGame: false,
	}

	return gameState
}

export function getIconPath(deck: Deck): string {
	switch (deck.iconType) {
		case 'item':
			return `/images/types/type-${deck.icon}.png`
		case 'hermit':
			return `/images/hermits-emoji/${deck.icon}.png`
		case 'effect':
			return `/images/effects/${deck.icon}.png`
	}
}
