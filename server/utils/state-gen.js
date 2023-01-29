import CARDS from '../cards'
import DAMAGE from '../const/damage'
import PROTECTION from '../const/protection'
import STRENGTHS from '../const/strengths'

export function getStarterPack() {
	// ['zombiecleo_common', 'zedaphplays_rare', 'ethoslab_ultra_rare']
	/*
	// Give all cards
	return Object.values(CARDS).map((card) => ({
		// type of card
		cardId: card.id,
		// unique identifier of this specific card instance
		cardInstance: Math.random() + '_' + Math.random(),
	}))
	*/
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
		.slice(0, 9)

	// ITEMS
	let items = allCards
		.filter(
			(card) =>
				card.type === 'item' &&
				hermits.find((hermitCard) => hermitCard.hermitType === card.hermitType)
		)
		.slice(0, 8)
	items = [...items, ...items]

	// EFFECTS
	const otherCards = allCards
		.filter((card) => !['hermit', 'item'].includes(card.type))
		.filter((card) => !['bed'].includes(card.id))
		.slice(0, 17)

	const pack = [...hermits, ...items, ...otherCards].map((card) => ({
		// type of card
		cardId: card.id,
		// unique identifier of this specific card instance
		cardInstance: Math.random() + '_' + Math.random(),
	}))

	// shuffle cards
	pack.sort(() => 0.5 - Math.random())

	pack.unshift({
		cardId: 'ethoslab_rare',
		cardInstance: Math.random() + '_' + Math.random(),
	})

	pack.unshift({
		cardId: 'item_redstone_rare',
		cardInstance: Math.random() + '_' + Math.random(),
	})

	pack.unshift({
		cardId: 'fortune',
		cardInstance: Math.random() + '_' + Math.random(),
	})

	pack.unshift({
		cardId: 'water_bucket',
		cardInstance: Math.random() + '_' + Math.random(),
	})

	pack.unshift({
		cardId: 'bow',
		cardInstance: Math.random() + '_' + Math.random(),
	})

	// ensure a hermit in first 5 cards
	const firstHermitIndex = pack.findIndex((card) => {
		return CARDS[card.cardId].type === 'hermit'
	})
	if (firstHermitIndex > 5) {
		;[pack[0], pack[firstHermitIndex]] = [pack[firstHermitIndex], pack[0]]
	}

	return pack

	// .filter((card) => card.type === 'hermit')
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
	const pack = getStarterPack()
	// TODO - ensure there is at least one hermit on the hand
	// OR - If there is no hermit, show the cards to the opposite player, reshuffle and draw again
	// TODO - strenghs/weaknesses -> 20 extra damage for prmary/secondayr attack

	const TOTAL_ROWS = 5
	return {
		id: playerId,
		playerName: allPlayers[playerId].playerName,
		coinFlips: {},
		lives: 3,
		hand: pack.slice(0, 7), // 0.7
		// TODO - hand out reward cards on kill
		// TODO - should be three cards from opponents deck
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
