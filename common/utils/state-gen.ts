import {CARDS} from '../cards'
import {Card, isAttach, isHermit, isItem, isSingleUse} from '../cards/types'
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
import {CONFIG} from '../config'
import {EXPANSIONS} from '../const/expansions'
import {STRENGTHS} from '../const/strengths'
import {PlayerEntity} from '../entities'
import {GameModel} from '../models/game-model'
import ComponentTable from '../types/ecs'
import {GameState} from '../types/game-state'
import {LocalCardInstance} from '../types/server-requests'
import {VirtualAI} from '../types/virtual-ai'
import {toLocalCardInstance} from './cards'
import {fisherYatesShuffle} from './fisher-yates'

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

export type OpponentDefs = PlayerDefs & {
	deck: Array<number | string | Card>
	virtualAI: VirtualAI
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
			position: 'back',
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
	const cards = components.filter(
		CardComponent,
		query.card.player(playerEntity),
		query.card.slot(query.slot.deck),
	)

	const amountOfStartingCards =
		options.startWithAllCards || options.unlimitedCards ? cards.length : 7

	if (options.shuffleDeck) {
		fisherYatesShuffle(cards).forEach((card, i) => {
			if (card.slot.inDeck()) card.slot.order = i
		})

		while (
			!cards.slice(0, amountOfStartingCards).some((card) => card.isHermit())
		) {
			fisherYatesShuffle(cards).forEach((card, i) => {
				if (card.slot.inDeck()) card.slot.order = i
			})
		}
	}

	for (let i = 0; i < options.extraStartingCards.length; i++) {
		const id = options.extraStartingCards[i]
		let slot = components.new(HandSlotComponent, playerEntity)
		components.new(CardComponent, id, slot.entity)
	}

	cards.slice(0, amountOfStartingCards).forEach((card) => {
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

		timer: {
			turnStartTime: 0,
			turnRemaining: 0,
			opponentActionStartTime: null,
		},

		isBossGame: false,
	}

	return gameState
}

export function getStarterPack(): Array<LocalCardInstance> {
	function randomBetween(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1) + min)
	}

	const limits = CONFIG.limits

	// only allow some starting types
	const startingTypes = ['balanced', 'builder', 'farm', 'miner', 'redstone']
	const typesCount = randomBetween(2, 3)
	const types = Object.keys(STRENGTHS)
		.filter((type) => startingTypes.includes(type))
		.sort(() => 0.5 - Math.random())
		.slice(0, typesCount)

	const cards = Object.values(CARDS).filter(
		(cardInfo) =>
			(!isHermit(cardInfo) ||
				!isItem(cardInfo) ||
				types.includes(cardInfo.type)) &&
			EXPANSIONS[cardInfo.expansion].disabled === false,
	)

	const effectCards = cards.filter(
		(card) => isSingleUse(card) || isAttach(card),
	)
	const hermitCount = typesCount === 2 ? 8 : 10

	const deck: Array<Card> = []

	let itemCounts = {
		[types[0]]: {
			items: 0,
			tokens: 0,
		},
		[types[1]]: {
			items: 0,
			tokens: 0,
		},
	}
	if (types[2]) {
		itemCounts[types[2]] = {
			items: 0,
			tokens: 0,
		}
	}
	let tokens = 0

	// hermits, but not diamond ones
	let hermitCards = cards
		.filter((card) => isHermit(card))
		.filter((card) => !isHermit(card) || types.includes(card.type))
		.filter((card) => card.name !== 'diamond')

	while (deck.length < hermitCount && hermitCards.length > 0) {
		const randomIndex = Math.floor(Math.random() * hermitCards.length)
		const hermitCard = hermitCards[randomIndex]

		// remove this option
		hermitCards = hermitCards.filter((_card, index) => index !== randomIndex)

		// add 1 - 3 of this hermit
		const hermitAmount = Math.min(
			randomBetween(1, 3),
			hermitCount - deck.length,
		)

		tokens +=
			(hermitCard.tokens !== 'wild' ? hermitCard.tokens : 1) * hermitAmount
		for (let i = 0; i < hermitAmount; i++) {
			deck.push(hermitCard)
			itemCounts[hermitCard.type].items += 2
		}
	}

	// items
	for (let type in itemCounts) {
		let counts = itemCounts[type]

		for (let i = 0; i < counts.items; i++) {
			deck.push(CARDS[`item_${type}_common`])
		}
	}

	let loopBreaker = 0
	// effects
	while (deck.length < limits.maxCards && deck.length < effectCards.length) {
		const effectCard =
			effectCards[Math.floor(Math.random() * effectCards.length)]

		const duplicates = deck.filter(
			(card) => card.numericId === effectCard.numericId,
		)
		if (duplicates.length >= limits.maxDuplicates) continue

		const tokenCost = effectCard.tokens !== 'wild' ? effectCard.tokens : 1
		if (tokens + tokenCost >= limits.maxDeckCost) {
			loopBreaker++
			continue
		} else {
			loopBreaker = 0
		}
		if (loopBreaker >= 100) {
			const err = new Error()
			console.log('Broke out of loop while generating starter deck!', err.stack)
			break
		}

		tokens += tokenCost
		deck.push(effectCard)
	}

	return deck.map((card) => toLocalCardInstance(card))
}
