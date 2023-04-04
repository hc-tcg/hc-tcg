import CARDS from '../cards'
import STRENGTHS from '../const/strengths'
import {CONFIG, DEBUG_CONFIG} from '../../config'
import {getCardCost} from './validation'

/**
 * @typedef {import("models/game-model").GameModel} GameModel
 * @typedef {import("models/player-model").PlayerModel} PlayerModel
 * @typedef {import("common/types/game-state").GameState} GameState
 * @typedef {import("common/types/game-state").PlayerState} PlayerState
 * @typedef {import("common/types/game-state").RowState} RowState
 * @typedef {import("common/types/cards").HermitCardT} HermitCardT
 * @typedef {import("common/types/cards").EffectCardT} EffectCardT
 * @typedef {import("common/types/cards").ItemCardT} ItemCardT
 * @typedef {import('common/types/game-state').LocalGameState} LocalGameState
 * @typedef {import('common/types/game-state').LocalPlayerState} LocalPlayerState
 */

function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

/** @type {(cardInfo: CardInfoT) => cardInfo is HermitCardT | ItemCardT} */
const isHermitOrItem = (cardInfo) => ['hermit', 'item'].includes(cardInfo.type)

/** @type {(cardInfo: CardInfoT) => cardInfo is HermitCardT} */
const isHermit = (cardInfo) => cardInfo.type === 'hermit'

/** @type {(cardInfo: CardInfoT) => cardInfo is EffectCardT} */
const isEffect = (cardInfo) => ['effect', 'single_use'].includes(cardInfo.type)

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
		(cardInfo) =>
			!isHermitOrItem(cardInfo) || hermitTypes.includes(cardInfo.hermitType)
	)

	const effectCards = cards.filter(isEffect)
	const hermitCount = hermitTypesCount === 2 ? 8 : 10

	const deck = []

	let itemCount = 0
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
	let hermitCards = cards
		.filter(isHermit)
		.filter((card) => getCardCost(card) !== limits.diamondCost)

	while (deck.length < hermitCount && hermitCards.length > 0) {
		const randomIndex = Math.floor(Math.random() * hermitCards.length)
		const hermitCard = hermitCards[randomIndex]

		// remove this option
		hermitCards = hermitCards.filter((card, index) => index !== randomIndex)

		// add 1 - 3 of this hermit
		const hermitAmount = Math.min(
			randomBetween(1, 3),
			hermitCount - deck.length
		)

		tokens += getCardCost(hermitCard) * hermitAmount
		for (let i = 0; i < hermitAmount; i++) {
			deck.push(hermitCard)
			itemCounts[hermitCard.hermitType].items += 2
			itemCount += 2
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
		const effectCard =
			effectCards[Math.floor(Math.random() * effectCards.length)]

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
	const deckIds = deck.map((card) => card.id)
	return deckIds
}

/**
 * @returns {RowState}
 */
export function getEmptyRow() {
	const MAX_ITEMS = 3

	/** @type {RowState} */
	const rowState = {
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
export function getPlayerState(player) {
	const pack = player.playerDeck.map((cardId) => ({
		cardId,
		cardInstance: Math.random() + '_' + Math.random(),
	}))

	// shuffle cards
	pack.sort(() => 0.5 - Math.random())

	// ensure a hermit in first 5 cards
	const hermitIndex = pack.findIndex((card) => {
		return CARDS[card.cardId].type === 'hermit'
	})
	if (hermitIndex > 5) {
		;[pack[0], pack[hermitIndex]] = [pack[hermitIndex], pack[0]]
	}

	const hand = pack.slice(0, 7)

	DEBUG_CONFIG.extraStartingCards.forEach((id) => {
		const card = CARDS[id]
		if (!!card) {
			hand.unshift({
				cardId: id,
				cardInstance: Math.random().toString(),
			})
		}
	})

	const TOTAL_ROWS = 5
	return {
		id: player.playerId,
		playerName: player.playerName,
		censoredPlayerName: player.censoredPlayerName,
		coinFlips: {},
		followUp: null,
		lives: 3,
		hand,
		discarded: [],
		pile: pack.slice(7),
		custom: {},
		board: {
			activeRow: null,
			singleUseCard: null,
			singleUseCardUsed: false,
			rows: new Array(TOTAL_ROWS).fill(null).map(getEmptyRow),
		},
	}
}

/**
 * @param {GameModel} game
 * @returns {GameState}
 */
export function getGameState(game) {
	const playerIds = game.getPlayerIds()
	if (Math.random() > 0.5) playerIds.reverse()

	/** @type {GameState} */
	const gameState = {
		turn: 0,
		order: playerIds,
		turnPlayerId: /** @type {any} */ (null),
		players: playerIds.reduce(
			(playerStates, playerId) => ({
				...playerStates,
				[playerId]: getPlayerState(game.players[playerId]),
			}),
			{}
		),

		timer: {
			turnTime: /** @type {any} */ (null),
			turnRemaining: /** @type {any} */ (null),
		},
	}
	return gameState
}

/**
 *
 * @param {PlayerState} playerState
 * @returns {LocalPlayerState}
 */
export function getLocalPlayerState(playerState) {
	/** @type {LocalPlayerState} */
	const localPlayerState = {
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
 * @param {AvailableActionsT} availableActions
 * @param {Array<string>} pastTurnActions
 * @param {AvailableActionsT} opponentAvailableActions
 * @returns {LocalGameState | null}
 */
export function getLocalGameState(
	game,
	player,
	availableActions = [],
	pastTurnActions = [],
	opponentAvailableActions = []
) {
	const opponentPlayerId = game
		.getPlayerIds()
		.find((id) => id !== player.playerId)
	if (!opponentPlayerId) {
		return null
	}

	const playerState = game.state.players[player.playerId]
	const opponentState = game.state.players[opponentPlayerId]

	// convert player states
	/** @type {Record<string, LocalPlayerState>} */
	const players = {}
	players[player.playerId] = getLocalPlayerState(playerState)
	players[opponentPlayerId] = getLocalPlayerState(opponentState)

	/** @type {LocalGameState} */
	const localGameState = {
		turn: game.state?.turn || 0,
		order: game.state?.order || [],

		// personal info
		hand: playerState.hand,
		pileCount: playerState.pile.length,
		discarded: playerState.discarded,

		// ids
		playerId: player.playerId,
		opponentPlayerId: opponentPlayerId,
		currentPlayerId: game.ds.currentPlayer.id,

		players,

		pastTurnActions:
			player.playerId === game.ds.currentPlayer.id ? pastTurnActions : [],
		availableActions:
			player.playerId === game.ds.currentPlayer.id
				? availableActions
				: opponentAvailableActions,

		timer: game.state.timer,
	}

	return localGameState
}
