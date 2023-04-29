import CARDS from '../cards'
import STRENGTHS from '../const/strengths'
import {CONFIG, DEBUG_CONFIG} from '../../config'

/**
 * @typedef {import("models/game-model").GameModel} GameModel
 * @typedef {import("models/player-model").PlayerModel} PlayerModel
 */

function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getStarterPack() {
	const limits = CONFIG.limits
	const characterTypesCount = randomBetween(2, 3)
	const characterTypes = Object.keys(STRENGTHS)
		.sort(() => 0.5 - Math.random())
		.slice(0, characterTypesCount)

	const cards = Object.values(CARDS).filter(
		(cardInfo) =>
			!['character', 'item'].includes(cardInfo.type) ||
			characterTypes.includes(cardInfo.characterType)
	)

	const characterCard = cards.filter((cardInfo) => cardInfo.type === 'character')
	const effectCards = cards.filter((cardInfo) =>
		['effect', 'single_use'].includes(cardInfo.type)
	)

	const characterCount = characterTypesCount === 2 ? 8 : 10
	const deck = []

	const itemsCosts = {}

	// characters
	while (deck.length < characterCount) {
		const randomIndex = Math.floor(Math.random() * characterCard.length)
		const characterCard = characterCard[randomIndex]

		const duplicates = deck.filter((card) => card.id === characterCard.id)
		const rarity = characterCard.rarity
		if (duplicates.length >= limits.maxDuplicates) continue
		if (rarity === 'ultra_rare' && duplicates.length >= 1) continue
		if (rarity === 'rare' && duplicates.length >= 2) continue

		deck.push(characterCard)

		const cost = characterCard.secondary.cost.filter(
			(characterType) => characterType === characterCard.characterType
		).length
		itemsCosts[characterCard.characterType] = itemsCosts[characterCard.characterType] || 0
		itemsCosts[characterCard.characterType] += cost
	}

	// items
	for (let characterType in itemsCosts) {
		let total = itemsCosts[characterType]
		let totalRare = 0
		if (total < 3) total = 3
		if (total > 4) {
			totalRare += 1
			total -= 1
		}
		if (total > 6) {
			totalRare += 1
			total -= 1
		}
		if (total > 8) total = 8

		const currenTotalRare = deck.filter((card) => card.rarity === 'rare').length
		if (totalRare + currenTotalRare > limits.maxRare) {
			const prevTotalRare = totalRare
			totalRare = Math.max(currenTotalRare - limits.maxRare, 0)
			total += prevTotalRare - totalRare
		}

		for (let i = 0; i < totalRare; i++)
			deck.push(CARDS[`item_${characterType}_rare`])
		for (let i = 0; i < total; i++)
			deck.push(CARDS[`item_${characterType}_common`])
	}

	// effects
	while (deck.length < limits.maxCards) {
		const effectCard =
			effectCards[Math.floor(Math.random() * effectCards.length)]

		const totalRare = deck.filter((card) => card.rarity === 'rare').length
		const totalUr = deck.filter((card) => card.rarity === 'ultra_rare').length

		if (totalRare >= limits.maxRare && effectCard.rarity === 'rare') continue
		if (totalUr >= limits.maxUltraRare && effectCard.rarity === 'ultra_rare')
			continue

		const duplicates = deck.filter((card) => card.id === effectCard.id)
		const rarity = effectCard.rarity
		if (rarity === 'ultra_rare' && duplicates.length >= 1) continue
		if (rarity === 'rare' && duplicates.length >= 2) continue
		if (duplicates.length >= limits.maxDuplicates) continue
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
	const pack = player.playerDeck.map((cardId) => ({
		cardId,
		cardInstance: Math.random() + '_' + Math.random(),
	}))

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
		rewards: pack.slice(7, 10),
		discarded: [],
		pile: pack.slice(10),
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
		turnPlayerId: null,
		turnTime: null,
		turnRemaining: null,
		players: playerIds.reduce(
			(playerStates, playerId) => ({
				...playerStates,
				[playerId]: getPlayerState(game.players[playerId]),
			}),
			{}
		),
	}
	return gameState
}
