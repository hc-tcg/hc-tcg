import CARDS from '../cards'
import {equalCard} from '../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/game-state').GameState} GameState
 * @typedef {import('common/types/pick-process').PickedCardT} PickedCardT
 * @typedef {import('common/types/pick-process').BoardPickedCardT} BoardPickedCardT
 */

/** @type {(pickedCard: PickedCardT) => pickedCard is BoardPickedCardT} */
const isOnPlayerBoard = (pickedCard) =>
	!['single_use', 'hand'].includes(pickedCard.slotType)

/**
 * Takes a list of card instances & looks them up in the current game (board/hand).
 * If found it maps it to {card, cardInfo playerId, row, rowIndex} info.
 * @param {GameState} gameState
 * @param {Array<PickedCardT>} pickedCards
 * @returns {Array<PickedCardInfo>}
 */
export function getPickedCardsInfoById(gameState, pickedCards) {
	/** @type {Array<PickedCardInfo | null>} */
	const result = (pickedCards || []).map((pickedCard) => {
		const {slotType, playerId, card} = pickedCard
		const pState = gameState.players[playerId]
		if (!slotType || !playerId || !pState) return null

		const cardInfo = card?.cardId ? CARDS[card.cardId] : null
		if (card && !cardInfo) return null

		if (slotType === 'hand') {
			if (!card) return null
			const inHand = pState.hand.some((handCard) => equalCard(handCard, card))
			if (!inHand) return null
			/** @type {HandPickedCardInfo} */
			const result = {
				...pickedCard,
				cardInfo,
				playerId,
			}
			return result
		}

		if (!isOnPlayerBoard(pickedCard)) return null

		if (!['item', 'effect', 'hermit'].includes(slotType)) {
			console.log(`Picking ${slotType} slot is not supported`)
			return null
		}

		const {rowIndex, slotIndex} = pickedCard
		if (typeof rowIndex !== 'number' || typeof slotIndex !== 'number')
			return null

		const row = pState.board.rows[rowIndex]
		if (!row || !row.hermitCard) return null

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

		/** @type {BoardPickedCardInfo} */
		const result = {
			...pickedCard,
			cardInfo,
			isActive:
				pState.board.activeRow !== null &&
				pickedCard.rowIndex === pState.board.activeRow,
			row,
		}
		return result
	})

	return /** @type {Array<PickedCardInfo>} */ (result.filter(Boolean))
}

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @returns {PickedCardsInfo}
 */
export function getPickedCardsInfo(game, turnAction) {
	const {pickedCards} = turnAction.payload || {}

	/** @type {PickedCardsInfo} */
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
