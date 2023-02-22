import CARDS from '../cards'
import STRENGTHS from '../const/strengths'
import config from '../../server-config.json' assert {type: 'json'}

/**
 * @typedef {import("models/game-model").Game} Game
 * @typedef {import("models/player-model").Player} Player
 */

function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getStarterPack() {
	const limits = config.limits
	const hermitTypesCount = randomBetween(2, 3)
	const hermitTypes = Object.keys(STRENGTHS)
		.sort(() => 0.5 - Math.random())
		.slice(0, hermitTypesCount)

	const cards = Object.values(CARDS).filter(
		(cardInfo) =>
			!['hermit', 'item'].includes(cardInfo.type) ||
			hermitTypes.includes(cardInfo.hermitType)
	)

	const hermitCards = cards.filter((cardInfo) => cardInfo.type === 'hermit')
	const effectCards = cards.filter((cardInfo) =>
		['effect', 'single_use'].includes(cardInfo.type)
	)

	const hermitCount = hermitTypesCount === 2 ? 8 : 10
	const deck = []

	const itemsCosts = {}

	// hermits
	while (deck.length < hermitCount) {
		const randomIndex = Math.floor(Math.random() * hermitCards.length)
		const hermitCard = hermitCards[randomIndex]

		const duplicates = deck.filter((card) => card.id === hermitCard.id)
		const rarity = hermitCard.rarity
		if (duplicates.length >= limits.maxDuplicates) continue
		if (rarity === 'ultra_rare' && duplicates.length >= 1) continue
		if (rarity === 'rare' && duplicates.length >= 2) continue

		deck.push(hermitCard)

		const cost = hermitCard.secondary.cost.filter(
			(hermitType) => hermitType === hermitCard.hermitType
		).length
		itemsCosts[hermitCard.hermitType] = itemsCosts[hermitCard.hermitType] || 0
		itemsCosts[hermitCard.hermitType] += cost
	}

	// items
	for (let hermitType in itemsCosts) {
		let total = itemsCosts[hermitType]
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
			deck.push(CARDS[`item_${hermitType}_rare`])
		for (let i = 0; i < total; i++)
			deck.push(CARDS[`item_${hermitType}_common`])
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
		hermitCard: null,
		effectCard: null,
		itemCards: new Array(MAX_ITEMS).fill(null),
		health: null,
		ailments: [],
	}
	return rowState
}

/**
 * @param {Player} player
 * @returns {PlayerState}
 */
export function getPlayerState(player) {
	const pack = player.playerDeck.map((cardId) => ({
		cardId,
		cardInstance: Math.random() + '_' + Math.random(),
	}))

	// shuffle cards
	pack.sort(() => 0.5 - Math.random())

	// pack.unshift({
	// 	cardId: 'grian_rare',
	// 	cardInstance: Math.random().toString(),
	// })

	// ensure a hermit in first 5 cards
	const hermitIndex = pack.findIndex((card) => {
		return CARDS[card.cardId].type === 'hermit'
	})
	if (hermitIndex > 5) {
		;[pack[0], pack[hermitIndex]] = [pack[hermitIndex], pack[0]]
	}

	const TOTAL_ROWS = 5
	return {
		id: player.playerId,
		playerName: player.playerName,
		coinFlips: {},
		followUp: null,
		lives: 3,
		hand: pack.slice(0, 7), // 0.7
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
 * @param {Game} game
 * @returns {GameState}
 */
export function getGameState(game) {
	const playerIds = game.getPlayerIds()
	if (Math.random() > 0.5) playerIds.reverse()

	/** @type {GameState} */
	const gameState = {
		turn: 0,
		order: playerIds,
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
