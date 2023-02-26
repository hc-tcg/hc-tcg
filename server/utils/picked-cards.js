import CARDS from '../cards'
import {equalCard} from '../utils'

/*
Takes a list of card instances & looks them up in the current game (board/hand).
If found it maps it to {card, cardInfo playerId, row, rowIndex} info.
*/
export function getPickedCardsInfoById(gameState, pickedCards) {
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
				isActive:
					pState.activeRow !== null && pickedCard.rowIndex === pState.activeRow,
				rowIndex: pickedCard.rowIndex,
				slotIndex: pickedCard.slotIndex,
				slotType,
				row,
				playerId,
			}
		})
		.filter(Boolean)
}

export function getPickedCardsInfo(game, turnAction) {
	const {pickedCards} = turnAction.payload || {}

	// Picked cards
	const pickedCardsInfo = {}
	Object.keys(pickedCards || {}).forEach((cardId) => {
		const pickedCardsForId = pickedCards[cardId]
		pickedCardsInfo[cardId] = getPickedCardsInfoById(
			game.state,
			pickedCardsForId
		)
	})

	return pickedCardsInfo
}
