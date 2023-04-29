import CARDS from '../cards'
import STRENGTHS from '../const/strengths'
import {CONFIG, DEBUG_CONFIG} from '../../config'
import {getCardCost, getCardRank} from './validation'

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

/** @type {(cardInfo: CardInfoT) => cardInfo is CharacterCardT | ItemCardT} */
const isCharacterOrItem = (cardInfo) => ['character', 'item'].includes(cardInfo.type)

/** @type {(cardInfo: CardInfoT) => cardInfo is CharacterCardT} */
const isCharacter = (cardInfo) => cardInfo.type === 'character'

/** @type {(cardInfo: CardInfoT) => cardInfo is EffectCardT} */
const isEffect = (cardInfo) => ['effect', 'single_use'].includes(cardInfo.type)

export function getStarterPack() {
	const limits = CONFIG.limits

	// only allow some starting types
	const startingTypes = ['cat', 'bacon', 'bot', 'minecraft']
	const characterTypesCount = randomBetween(2, 3)
	const characterTypes = Object.keys(STRENGTHS)
		.filter((type) => startingTypes.includes(type))
		.sort(() => 0.5 - Math.random())
		.slice(0, characterTypesCount)

	const cards = Object.values(CARDS).filter(
		(cardInfo) =>
			!isCharacterOrItem(cardInfo) || characterTypes.includes(cardInfo.characterType)
	)

	const effectCards = cards.filter(isEffect)
	const characterCount = characterTypesCount === 2 ? 8 : 10

	const deck = []

	let itemCount = 0
	let itemCounts = {
		[characterTypes[0]]: {
			items: 0,
			tokens: 0,
		},
		[characterTypes[1]]: {
			items: 0,
			tokens: 0,
		},
	}
	if (characterTypes[2]) {
		itemCounts[characterTypes[2]] = {
			items: 0,
			tokens: 0,
		}
	}
	let tokens = 0

	// characters, but not diamond ones
	let characterCards = cards
		.filter(isCharacter)
		.filter((card) => getCardRank(card.id).name !== 'diamond')

	while (deck.length < characterCount && characterCards.length > 0) {
		const randomIndex = Math.floor(Math.random() * characterCards.length)
		const characterCard = characterCards[randomIndex]

		// remove this option
		characterCards = characterCards.filter((card, index) => index !== randomIndex)

		// add 1 - 3 of this character
		const characterAmount = Math.min(
			randomBetween(1, 3),
			characterCount - deck.length
		)

		tokens += getCardCost(characterCard) * characterAmount
		for (let i = 0; i < characterAmount; i++) {
			deck.push(characterCard)
			itemCounts[characterCard.characterType].items += 2
			itemCount += 2
		}
	}

	// items
	for (let characterType in itemCounts) {
		let counts = itemCounts[characterType]

		for (let i = 0; i < counts.items; i++) {
			deck.push(CARDS[`item_${characterType}_common`])
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
		characterCard: null,
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
	const pack = player.playerDeck.cards

	// shuffle cards
	pack.sort(() => 0.5 - Math.random())

	// ensure a character in first 5 cards
	const characterIndex = pack.findIndex((card) => {
		return CARDS[card.cardId].type === 'character'
	})
	if (characterIndex > 5) {
		;[pack[0], pack[characterIndex]] = [pack[characterIndex], pack[0]]
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
