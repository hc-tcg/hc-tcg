import CARDS from '../cards'
import STRENGTHS from '../const/strengths'

export function getStarterPack() {
	// TODO - Beef had 42 cards in decks for TangoVsXisuma match (also in EP41 he said 42 is max)
	const allCards = Object.values(CARDS).sort(() => 0.5 - Math.random())

	// HERMITS
	const hermitTypes = Object.keys(STRENGTHS)
		.sort(() => 0.5 - Math.random())
		.slice(0, 3)

	const hermits = allCards
		.filter(
			(card) => card.type === 'hermit' && hermitTypes.includes(card.hermitType)
		)
		.slice(0, 8)

	// ITEMS
	let itemCards = allCards.filter((card) => card.type === 'item')
	let items = []
	for (let hermit of hermits) {
		const hermitItemCards = itemCards.filter(
			(itemCard) => itemCard.hermitType === hermit.hermitType
		)
		const commonItem = hermitItemCards.find((item) => item.rarity === 'common')
		const rareItem = hermitItemCards.find((item) => item.rarity === 'rare')

		const hasTriple = hermit.secondary.cost.length > 2
		for (let i = 0, j = hasTriple ? 3 : 2; i < j; i++) {
			const isRare = Math.random() > 0.85
			items.push(isRare ? rareItem : commonItem)
			if (isRare) j--
		}
	}

	// EFFECTS
	const otherCards = allCards
		.filter((card) => !['hermit', 'item'].includes(card.type))
		.slice(0, 42 - items.length - hermits.length)

	const pack = [...hermits, ...items, ...otherCards].map((card) => card.id)

	return pack
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

	pack.unshift({
		cardId: 'wolf',
		cardInstance: Math.random().toString(),
	})

	pack.unshift({
		cardId: 'thorns',
		cardInstance: Math.random().toString(),
	})

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
