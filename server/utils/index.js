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

/*
Return reference to the object holding the card and key at which it is located
Looks only through hand and item/effect/hermit slots.
*/
export function findCard(gameState, card) {
	const pStates = Object.values(gameState.players)
	for (let pState of pStates) {
		const playerId = pState.id
		const handIndex = pState.hand.findIndex((handCard) =>
			equalCard(handCard, card)
		)
		if (handIndex !== -1) return {playerId, target: pState.hand, key: handIndex}

		const rows = pState.board.rows
		for (let row of rows) {
			let key = null
			if (equalCard(row.hermitCard, card))
				return {playerId, target: row, key: 'hermitCard'}
			if (equalCard(row.effectCard, card))
				return {playerId, target: row, key: 'effectCard'}
			const itemIndex = row.itemCards.findIndex((itemCard) =>
				equalCard(itemCard, card)
			)
			if (itemIndex !== -1)
				return {playerId, target: row.itemCards, key: itemIndex}
		}
	}
	return null
}

export function discardCard(gameState, card) {
	const loc = findCard(gameState, card)
	if (!loc) {
		const err = new Error()
		return console.log('Cannot find card: ', card, err.stack)
	}
	loc.target[loc.key] = null
	Object.values(gameState.players).forEach((pState) => {
		pState.hand = pState.hand.filter(Boolean)
	})
	gameState.players[loc.playerId].discarded.push({
		cardId: card.cardId,
		cardInstance: card.cardInstance,
	})
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
		.map((pickedCard) => {
			const {slotType, playerId, card} = pickedCard
			const pState = gameState.players[playerId]
			if (!slotType || !playerId || !pState) return null

			const cardInfo = CARDS[card?.cardId]
			if (card && !cardInfo) return null

			if (slotType === 'hand') {
				if (!card) return null
				const inHand = pState.hand.some((handCard) => equalCard(handCard, card))
				if (!inHand) return null
				return {
					card,
					cardInfo,
					playerId,
					slotType,
				}
			}

			if (!['item', 'effect', 'hermit'].includes(slotType)) {
				console.log(`Picking ${slotType} slot is not supported`)
				return null
			}

			const {rowIndex, slotIndex} = pickedCard
			if (typeof rowIndex !== 'number' || typeof slotIndex !== 'number')
				return null

			const row = pState.board.rows[rowIndex]
			if (!row) return null

			// Validate that received card & position match with server state
			let cardOnPosition = null
			if (slotType === 'hermit') cardOnPosition = row.hermitCard
			else if (slotType === 'effect') cardOnPosition = row.effectCard
			else if (slotType === 'item') cardOnPosition = row.itemCards[slotIndex]
			if (card) {
				if (!cardOnPosition || !equalCard(card, cardOnPosition)) return null
			} else if (cardOnPosition) {
				return null
			}

			return {
				card,
				cardInfo,
				rowIndex: pickedCard.rowIndex,
				slotIndex: pickedCard.slotIndex,
				slotType,
				row,
				playerId,
			}
		})
		.filter(Boolean)
}

export function flipCoin() {
	return Math.random() > 0.5 ? 'heads' : 'tails'
}
