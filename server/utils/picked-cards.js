import CARDS from '../../common/cards'
import {equalCard} from '../utils'

/**
 * @typedef {import('common/types/game-state').GameState} GameState
 * @typedef {import('common/types/pick-process').PickedSlotT} PickedSlotT
 * @typedef {import('common/types/pick-process').BoardPickedSlotT} BoardPickedSlotT
 * @typedef {import('common/types/pick-process').BoardPickedSlotInfo} BoardPickedSlotInfo
 * @typedef {import('common/types/pick-process').HandPickedSlotInfo} HandPickedSlotInfo
 * @typedef {import('common/types/pick-process').PickedSlotInfo} PickedSlotInfo
 * @typedef {import('common/types/pick-process').PickedSlotsInfo} PickedSlotsInfo
 * @typedef {import('common/types/pick-process').PickResultT} PickResultT
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('server/models/game-model').GameModel} GameModel
 */

/** @type {(pickedCard: PickedSlotT) => pickedCard is BoardPickedSlotT} */
const isOnPlayerBoard = (pickedCard) =>
	!['single_use', 'hand'].includes(pickedCard.slotType)

/**
 * Takes a list of card instances & looks them up in the current game (board/hand).
 * If found it maps it to {card, cardInfo playerId, row, rowIndex} info.
 * @param {GameState} gameState
 * @param {Array<PickedSlotT>} pickedCards
 * @returns {Array<PickedSlotInfo>}
 */
export function getPickedSlotsInfoById(gameState, pickedCards) {
	/** @type {Array<PickedSlotInfo | null>} */
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
			/** @type {HandPickedSlotInfo} */
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

		/** @type {BoardPickedSlotInfo} */
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

	return /** @type {Array<PickedSlotInfo>} */ (result.filter(Boolean))
}

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @returns {PickedSlotsInfo}
 */
export function getPickedSlotsInfo(game, turnAction) {
	const {pickResults} = turnAction.payload || {}
	if (!pickResults) return {}

	/** @type {PickedSlotsInfo} */
	const pickedSlotsInfo = {}
	for (const cardId in pickResults) {
		const pickedSlotsForId = pickResults[cardId]
		pickedSlotsInfo[cardId] = []
		for (let i = 0; i < pickedSlotsForId.length; i++) {
			const result = pickedSlotsForId[i]
			const pickedSlotsForReq = result.pickedSlots
			const slotsInfo = getPickedSlotsInfoById(game.state, pickedSlotsForReq)
			pickedSlotsInfo[cardId].push(...slotsInfo)
		}
	}

	return pickedSlotsInfo
}
