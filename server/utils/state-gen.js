import CARDS from '../cards'
import STRENGTHS from '../const/strengths'

function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getStarterPack() {
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
		if (rarity === 'ultra_rare' && duplicates.length >= 1) continue
		if (rarity === 'rare' && duplicates.length >= 2) continue
		if (duplicates.length >= 3) continue

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
		if (totalRare + currenTotalRare > 12) {
			const prevTotalRare = totalRare
			totalRare = Math.max(currenTotalRare - 12, 0)
			total += prevTotalRare - totalRare
		}

		for (let i = 0; i < totalRare; i++)
			deck.push(CARDS[`item_${hermitType}_rare`])
		for (let i = 0; i < total; i++)
			deck.push(CARDS[`item_${hermitType}_common`])
	}

	// effects
	while (deck.length < 42) {
		const effectCard =
			effectCards[Math.floor(Math.random() * effectCards.length)]

		const totalRare = deck.filter((card) => card.rarity === 'rare').length
		const totalUr = deck.filter((card) => card.rarity === 'ultra_rare').length

		if (totalRare >= 12 && effectCard.rarity === 'rare') continue
		if (totalUr >= 3 && effectCard.rarity === 'ultra_rare') continue

		const duplicates = deck.filter((card) => card.id === effectCard.id)
		const rarity = effectCard.rarity
		if (rarity === 'ultra_rare' && duplicates.length >= 1) continue
		if (rarity === 'rare' && duplicates.length >= 2) continue
		if (duplicates.length >= 3) continue
		deck.push(effectCard)
	}

	const deckIds = deck.map((card) => card.id)
	return deckIds
}

export function getEmptyRow() {
	const MAX_ITEMS = 3
	return {
		hermitCard: null,
		effectCard: null,
		itemCards: new Array(MAX_ITEMS).fill(null),
		health: null,
		ailments: [],
	}
}

export function getPlayerState(allPlayers, playerId) {
	const pack = allPlayers[playerId].playerDeck.map((cardId) => ({
		cardId,
		cardInstance: Math.random() + '_' + Math.random(),
	}))

	// shuffle cards
	pack.sort(() => 0.5 - Math.random())

	// pack.unshift({
	// 	cardId: 'wolf',
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
		id: playerId,
		playerName: allPlayers[playerId].playerName,
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

export function getGameState(allPlayers, gamePlayerIds) {
	if (Math.random() > 0.5) gamePlayerIds.reverse()
	return {
		turn: 0,
		order: gamePlayerIds,
		players: gamePlayerIds.reduce(
			(playerStates, playerId) => ({
				...playerStates,
				[playerId]: getPlayerState(allPlayers, playerId),
			}),
			{}
		),
	}
}
