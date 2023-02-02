import CARDS from '../cards'
import {equalCard} from '../utils'

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

/*
Gives:
- Info about current player
	- activeRow
- Info about opponent player
- Info about single use card
- Info about picked cards

Note that as it is right now it is a potential source of bugs as hooks receive values from start of action,
that are not updated. So e.g. activeRow may no longer be active etc. Perhaps using getters/setters instead?
*/
export function getDerivedState(game, turnAction, baseDerivedState) {
	const {currentPlayer, opponentPlayer} = baseDerivedState
	const {pickedCards} = turnAction.payload || {}

	// Current player
	const playerActiveRow =
		currentPlayer.board.activeRow !== null
			? currentPlayer.board.rows[currentPlayer.board.activeRow]
			: null
	const playerHermitCard = playerActiveRow ? playerActiveRow.hermitCard : null
	const playerHermitInfo = playerHermitCard
		? CARDS[playerHermitCard.cardId]
		: null
	const playerEffectCard = playerActiveRow ? playerActiveRow.effectCard : null
	const playerEffectCardInfo = playerEffectCard
		? CARDS[playerEffectCard.cardId]
		: null

	// Opponent player
	const opponentActiveRow =
		opponentPlayer.board.activeRow !== null
			? opponentPlayer.board.rows[opponentPlayer.board.activeRow]
			: null
	const opponentHermitCard = opponentActiveRow
		? opponentActiveRow.hermitCard
		: null
	const opponentHermitInfo = opponentHermitCard
		? CARDS[opponentHermitCard.cardId]
		: null
	const opponentEffectCard = opponentActiveRow
		? opponentActiveRow.effectCard
		: null
	const opponentEffectCardInfo = opponentEffectCard
		? CARDS[opponentEffectCard.cardId]
		: null

	// Single use card
	const singleUseCard = currentPlayer.board.singleUseCard
	const singleUseInfo = singleUseCard ? CARDS[singleUseCard.cardId] : null

	// Picked cards
	const pickedCardsInfo = {}
	Object.keys(pickedCards || {}).forEach((cardId) => {
		const pickedCardsForId = pickedCards[cardId]
		pickedCardsInfo[cardId] = getPickedCardsInfo(game.state, pickedCardsForId)
	})

	return {
		...baseDerivedState,
		playerActiveRow,
		playerHermitCard,
		playerHermitInfo,
		playerEffectCard,
		playerEffectCardInfo,
		opponentActiveRow,
		opponentHermitCard,
		opponentHermitInfo,
		opponentEffectCard,
		opponentEffectCardInfo,
		singleUseCard,
		singleUseInfo,
		pickedCardsInfo,
	}
}
