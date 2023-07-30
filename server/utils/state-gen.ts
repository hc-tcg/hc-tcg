import CARDS from '../../common/cards'
import STRENGTHS from '../../common/const/strengths'
import {CONFIG, DEBUG_CONFIG} from '../../config'
import {getCardCost, getCardRank} from './validation'
import {
	AvailableActionsT,
	CardT,
	CoinFlipT,
	GameState,
	LocalGameState,
	LocalPlayerState,
	PlayerState,
	RowState,
	WaterfallHook,
} from '../../common/types/game-state'
import {GameModel} from '../models/game-model'
import {PlayerModel} from '../models/player-model'
import Card from '../../common/cards/card-plugins/_card'
import HermitCard from '../../common/cards/card-plugins/hermits/_hermit-card'
import ItemCard from '../../common/cards/card-plugins/items/_item-card'
import EffectCard from '../../common/cards/card-plugins/effects/_effect-card'
import {CardPos, EnergyT} from '../../common/types/cards'
import {PickedSlots} from '../../common/types/pick-process'
import {AttackModel} from '../models/attack-model'
import {GameHook} from '../../common/types/hooks'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

/**
 * @typedef {import("server/models/player-model").PlayerModel} PlayerModel
 * @typedef {import("common/types/game-state").GameState} GameState
 * @typedef {import("common/types/game-state").PlayerState} PlayerState
 * @typedef {import("common/types/game-state").RowState} RowState
 * @typedef {import("common/cards/card-plugins/single-use/_single-use-card")} SingleUseCard
 * @typedef {import('common/types/game-state').LocalGameState} LocalGameState
 * @typedef {import('common/types/game-state').LocalPlayerState} LocalPlayerState
 */

function randomBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

/** @type {(cardInfo: Card) => cardInfo is HermitCard | ItemCard} */
const isHermitOrItem: (cardInfo: Card) => cardInfo is HermitCard | ItemCard = (
	cardInfo
): cardInfo is HermitCard | ItemCard => ['hermit', 'item'].includes(cardInfo.type)

/** @type {(cardInfo: Card) => cardInfo is HermitCard} */
const isHermit: (cardInfo: Card) => cardInfo is HermitCard = (cardInfo): cardInfo is HermitCard =>
	cardInfo.type === 'hermit'

/** @type {(cardInfo: Card) => cardInfo is EffectCard} */
const isEffect: (cardInfo: Card) => cardInfo is EffectCard = (cardInfo): cardInfo is EffectCard =>
	['effect', 'single_use'].includes(cardInfo.type)

export function getStarterPack() {
	const limits = CONFIG.limits

	// only allow some starting types
	const startingTypes = ['balanced', 'builder', 'farm', 'miner', 'redstone']
	const hermitTypesCount = randomBetween(2, 3)
	const hermitTypes = Object.keys(STRENGTHS)
		.filter((type) => startingTypes.includes(type))
		.sort(() => 0.5 - Math.random())
		.slice(0, hermitTypesCount)

	const cards = Object.values(CARDS).filter(
		(cardInfo) => !isHermitOrItem(cardInfo) || hermitTypes.includes(cardInfo.hermitType)
	)

	const effectCards = cards.filter(isEffect)
	const hermitCount = hermitTypesCount === 2 ? 8 : 10

	const deck: Array<Card> = []

	let itemCounts = {
		[hermitTypes[0]]: {
			items: 0,
			tokens: 0,
		},
		[hermitTypes[1]]: {
			items: 0,
			tokens: 0,
		},
	}
	if (hermitTypes[2]) {
		itemCounts[hermitTypes[2]] = {
			items: 0,
			tokens: 0,
		}
	}
	let tokens = 0

	// hermits, but not diamond ones
	let hermitCards = cards.filter(isHermit).filter((card) => getCardRank(card.id).name !== 'diamond')

	while (deck.length < hermitCount && hermitCards.length > 0) {
		const randomIndex = Math.floor(Math.random() * hermitCards.length)
		const hermitCard = hermitCards[randomIndex]

		// remove this option
		hermitCards = hermitCards.filter((card, index) => index !== randomIndex)

		// add 1 - 3 of this hermit
		const hermitAmount = Math.min(randomBetween(1, 3), hermitCount - deck.length)

		tokens += getCardCost(hermitCard) * hermitAmount
		for (let i = 0; i < hermitAmount; i++) {
			deck.push(hermitCard)
			itemCounts[hermitCard.hermitType].items += 2
		}
	}

	// items
	for (let hermitType in itemCounts) {
		let counts = itemCounts[hermitType]

		for (let i = 0; i < counts.items; i++) {
			deck.push(CARDS[`item_${hermitType}_common`])
		}
	}

	let loopBreaker = 0
	// effects
	while (deck.length < limits.maxCards) {
		const effectCard = effectCards[Math.floor(Math.random() * effectCards.length)]

		const duplicates = deck.filter((card) => card.id === effectCard.id)
		if (duplicates.length >= limits.maxDuplicates) continue

		const tokenCost = getCardCost(effectCard)
		if (tokens + tokenCost >= limits.maxDeckCost) {
			loopBreaker++
			continue
		} else {
			loopBreaker = 0
		}
		if (loopBreaker >= 10000) {
			const err = new Error()
			console.log('Broke out of loop while generating starter deck!', err.stack)
			break
		}

		tokens += tokenCost
		deck.push(effectCard)
	}

	/**
	 * @type {Array<string>}
	 */
	const deckIds: Array<string> = deck.map((card) => card.id)
	return deckIds
}

/**
 * @returns {RowState}
 */
export function getEmptyRow(): RowState {
	const MAX_ITEMS = 3

	/** @type {RowState} */
	const rowState: RowState = {
		hermitCard: null,
		effectCard: null,
		itemCards: new Array(MAX_ITEMS).fill(null),
		health: null,
		ailments: [],
	}
	return rowState
}

/**
 * @param {PlayerModel} player
 * @returns {PlayerState}
 */
export function getPlayerState(player: PlayerModel): PlayerState {
	let pack = player.playerDeck.cards

	// shuffle cards
	pack.sort(() => 0.5 - Math.random())

	// randomize instances
	pack = pack.map((card) => {
		return {
			cardId: card.cardId,
			cardInstance: Math.random().toString(),
		}
	})

	// ensure a hermit in first 5 cards
	const hermitIndex = pack.findIndex((card) => {
		return CARDS[card.cardId].type === 'hermit'
	})
	if (hermitIndex > 5) {
		;[pack[0], pack[hermitIndex]] = [pack[hermitIndex], pack[0]]
	}

	const amountOfStartingCards = DEBUG_CONFIG.startWithAllCards ? pack.length : 7
	const hand = pack.slice(0, amountOfStartingCards)

	for (let i = 0; i < DEBUG_CONFIG.extraStartingCards.length; i++) {
		const id = DEBUG_CONFIG.extraStartingCards[i]
		const card = CARDS[id]
		if (!card) continue

		const cardInfo = {
			cardId: id,
			cardInstance: Math.random().toString(),
		}
		pack.push(cardInfo)
		hand.unshift(cardInfo)
	}

	const TOTAL_ROWS = 5
	return {
		id: player.playerId,
		playerName: player.playerName,
		playerDeck: pack,
		censoredPlayerName: player.censoredPlayerName,
		coinFlips: [],
		followUp: {},
		lives: 3,
		hand,
		discarded: [],
		pile: DEBUG_CONFIG.startWithAllCards ? [] : pack.slice(7),
		custom: {},
		board: {
			activeRow: null,
			singleUseCard: null,
			singleUseCardUsed: false,
			rows: new Array(TOTAL_ROWS).fill(null).map(getEmptyRow),
		},

		hooks: {
			/** Hook that modifies and returns available energy from item cards */
			availableEnergy: new WaterfallHook<(availableEnergy: Array<EnergyT>) => Array<EnergyT>>(),

			/** Hook that modifies and returns blockedActions */
			blockedActions: new WaterfallHook<
				(
					blockedActions: AvailableActionsT,
					pastTurnActions: AvailableActionsT,
					availableEnergy: Array<EnergyT>
				) => AvailableActionsT
			>(),
			/** Hook that modifies and returns availableActions */
			availableActions: new WaterfallHook<
				(
					availableActions: AvailableActionsT,
					pastTurnActions: AvailableActionsT,
					availableEnergy: Array<EnergyT>
				) => AvailableActionsT
			>(),

			/** Hook called when a card is attached */
			onAttach: new GameHook<(instance: string) => void>(),
			/** Hook called when a card is detached */
			onDetach: new GameHook<(instance: string) => void>(),

			/** Hook called before a single use card is applied */
			beforeApply: new GameHook<(pickedSlots: PickedSlots, modalResult: any) => void>(),
			/** Hook called when a single use card is applied */
			onApply: new GameHook<(pickedSlots: PickedSlots, modalResult: any) => void>(),
			/** Hook called after a single use card is applied */
			afterApply: new GameHook<(pickedSlots: PickedSlots, modalResult: any) => void>(),

			/** Hook that returns attacks to execute */
			getAttacks: new GameHook<(pickedSlots: PickedSlots) => Array<AttackModel>>(),
			/** Hook called before the main attack loop, for every attack from our side of the board */
			beforeAttack: new GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>(),
			/** Hook called before the main attack loop, for every attack targeting our side of the board */
			beforeDefence: new GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>(),
			/** Hook called for every attack from our side of the board */
			onAttack: new GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>(),
			/** Hook called for every attack that targets our side of the board */
			onDefence: new GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>(),
			/** Hook called after the main attack loop, for every attack from our side of the board */
			afterAttack: new GameHook<(attack: AttackModel) => void>(),
			/** Hook called after the main attack loop, for every attack targeting our side of the board */
			afterDefence: new GameHook<(attack: AttackModel) => void>(),

			/** Hook called on follow up */
			onFollowUp: new GameHook<
				(followUp: string, pickedSlots: PickedSlots, modalResult: any) => void
			>(),
			/** Hook called when follow up times out */
			onFollowUpTimeout: new GameHook<(followUp: string) => void>(),

			/**
			 * Hook called when a hermit is about to die.
			 */
			onHermitDeath: new GameHook<(hermitPos: CardPos) => void>(),

			/** hook called at the start of the turn */
			onTurnStart: new GameHook<() => void>(),
			/** hook called at the end of the turn */
			onTurnEnd: new GameHook<(drawCards: Array<CardT>) => void>(),
			/** hook called when the time runs out*/
			onTurnTimeout: new GameHook<(newAttacks: Array<AttackModel>) => void>(),

			/** hook called the player flips a coin */
			onCoinFlip: new GameHook<(id: string, coinFlips: Array<CoinFlipT>) => Array<CoinFlipT>>(),

			/** hook called when Hermit becomes active */
			onBecomeActive: new GameHook<(row: number) => void>(),
		},
	}
}

/**
 * @param {GameModel} game
 * @returns {GameState}
 */
export function getGameState(game: GameModel): GameState {
	const playerIds = game.getPlayerIds()
	if (Math.random() > 0.5) playerIds.reverse()

	/** @type {GameState} */
	const gameState: GameState = {
		turn: 0,
		order: playerIds,
		turnPlayerId: playerIds[0],
		players: playerIds.reduce(
			(playerStates, playerId) => ({
				...playerStates,
				[playerId]: getPlayerState(game.players[playerId]),
			}),
			{}
		),

		timer: {
			turnTime: 0,
			turnRemaining: 0,
		},
	}
	return gameState
}

/**
 *
 * @param {PlayerState} playerState
 * @returns {LocalPlayerState}
 */
export function getLocalPlayerState(playerState: PlayerState): LocalPlayerState {
	/** @type {LocalPlayerState} */
	const localPlayerState: LocalPlayerState = {
		id: playerState.id,
		followUp: playerState.followUp,
		playerName: playerState.playerName,
		censoredPlayerName: playerState.censoredPlayerName,
		coinFlips: playerState.coinFlips,
		custom: playerState.custom,
		lives: playerState.lives,
		board: playerState.board,
	}
	return localPlayerState
}

/**
 *
 * @param {GameModel} game
 * @param {PlayerModel} player
 * @param {import('common/types/game-state').AvailableActionsT} availableActions
 * @param {Array<string>} pastTurnActions
 * @param {import('common/types/game-state').AvailableActionsT} opponentAvailableActions
 * @returns {LocalGameState | null}
 */
export function getLocalGameState(
	game: GameModel,
	player: PlayerModel,
	availableActions: AvailableActionsT = [],
	pastTurnActions: Array<string> = [],
	opponentAvailableActions: AvailableActionsT = []
): LocalGameState | null {
	const opponentPlayerId = game.getPlayerIds().find((id) => id !== player.playerId)
	if (!opponentPlayerId) {
		return null
	}

	const playerState = game.state.players[player.playerId]
	const opponentState = game.state.players[opponentPlayerId]

	// convert player states
	/** @type {Record<string, LocalPlayerState>} */
	const players: Record<string, LocalPlayerState> = {}
	players[player.playerId] = getLocalPlayerState(playerState)
	players[opponentPlayerId] = getLocalPlayerState(opponentState)

	/** @type {LocalGameState} */
	const localGameState: LocalGameState = {
		turn: game.state?.turn || 0,
		order: game.state?.order || [],

		// personal info
		hand: playerState.hand,
		pileCount: playerState.pile.length,
		discarded: playerState.discarded,

		// ids
		playerId: player.playerId,
		opponentPlayerId: opponentPlayerId,
		currentPlayerId: game.currentPlayer.id,

		players,

		pastTurnActions: player.playerId === game.currentPlayer.id ? pastTurnActions : [],
		availableActions:
			player.playerId === game.currentPlayer.id ? availableActions : opponentAvailableActions,

		timer: game.state.timer,
	}

	return localGameState
}
