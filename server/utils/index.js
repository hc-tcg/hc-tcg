import CARDS from '../cards'

export function equalCard(card1, card2) {
	if (!card1 || !card2) return false
	return (
		card1.cardId === card2.cardId && card1.cardInstance === card2.cardInstance
	)
}

export function hasEnoughItems(itemCards, cost) {
	const itemCardIds = itemCards.map((card) => card.cardId)
	// transform item cards into cost
	// ['eye_of_ender_2x', 'oak_stairs'] -> ['speedrunner', 'speedrunner', 'builder']
	const energy = itemCardIds.reduce((result, cardId) => {
		const itemCard = CARDS[cardId]
		result.push(itemCard.hermitType)
		// all rare item cards are x2
		if (itemCard.rarity === 'rare') {
			result.push(itemCard.hermitType)
		}
		return result
	}, [])

	const specificCost = cost.filter((item) => item !== 'any')
	const anyCost = cost.filter((item) => item === 'any')
	const hasEnoughSpecific = specificCost.every((costItem) => {
		const index = energy.findIndex((energyItem) => energyItem === costItem)
		if (index === -1) return false
		energy.splice(index, 1)
		return true
	})
	if (!hasEnoughSpecific) return false

	// check if remaining energy is enough to cover required "any" cost
	return energy.length >= anyCost.length
}

export function hasSingleUse(playerState, id, isUsed = false) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	return suCard?.cardId === id && suUsed === isUsed
}

export function applySingleUse(playerState) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	if (!suCard) return
	playerState.board.singleUseCardUsed = true
}

export function discardSingleUse(playerState) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	if (!suCard) return
	if (suUsed) {
		playerState.discarded.push(suCard)
	} else {
		playerState.hand.push(suCard)
	}
	playerState.board.singleUseCardUsed = false
	playerState.board.singleUseCard = null
}

/*
Takes a list of card instances & looks them up in the current game (board/hand).
If found it maps it to {card, cardInfo playerId, row, rowIndex} info.
*/
export function getPickedCardsInfo(gameState, pickedCards) {
	return (pickedCards || [])
		.map((card) => {
			const cardInfo = CARDS[card.cardId]
			if (!cardInfo) return null

			const playerStates = Object.values(gameState.players)
			let rowIndex = null
			const pState = playerStates.find((pState) => {
				rowIndex =
					pState.board.rows.findIndex((row) => {
						return (
							equalCard(row.hermitCard, card) ||
							equalCard(row.effectCard, card) ||
							row.itemCards.some((itemCard) => equalCard(itemCard, card))
						)
					}) || null
				const inHand = pState.hand.some((handCard) => equalCard(handCard, card))
				return rowIndex !== -1 || inHand
			})
			if (!pState) return null
			return {
				card,
				cardInfo,
				playerId: pState.id,
				rowIndex,
				row: pState.board.rows[rowIndex],
			}
		})
		.filter(Boolean)
}
