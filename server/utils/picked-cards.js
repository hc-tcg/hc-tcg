import {equalCard} from '.'
import {validPicks} from './reqs'

/**
 * @typedef {import('common/types/game-state').GameState} GameState
 * @typedef {import('common/types/pick-process').PickedSlotT} PickedSlotT
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/pick-process').PickResultT} PickResultT
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('server/models/game-model').GameModel} GameModel
 */

/**
 * @param {GameModel} game
 * @param {PickedSlotT[]} pickedSlots
 * @returns {PickedSlotT[] | null}
 */
export function validatePickedSlots(game, pickedSlots) {
	const validPickedSlots = []
	for (const pickedSlot of pickedSlots) {
		const {type, card, index} = pickedSlot.slot
		if (!game.state.order.includes(pickedSlot.playerId)) return null

		const player = game.state.players[pickedSlot.playerId]
		if (!['hand', 'hermit', 'effect', 'item'].includes(type)) return null
		if (type === 'hand' && card) {
			if (!equalCard(player.hand[index], card)) return null
		} else if (['hermit', 'effect', 'item'].includes(type) && pickedSlot.row) {
			const {hermitCard, effectCard, itemCards} =
				player.board.rows[pickedSlot.row.index]
			if (
				(type === 'hermit' && !equalCard(hermitCard, card)) ||
				(type === 'effect' && !equalCard(effectCard, card)) ||
				(type === 'item' && !equalCard(itemCards[index], card))
			)
				return null

			// We don't trust the client
			pickedSlot.row.state =
				game.state.players[pickedSlot.playerId].board.rows[pickedSlot.row.index]
		}
		validPickedSlots.push(pickedSlot)
	}

	return validPickedSlots
}

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @returns {PickedSlots | null}
 */
export function getPickedSlots(game, turnAction) {
	if (!turnAction.payload || !turnAction.payload.pickResults) return {}
	const pickResults = turnAction.payload.pickResults

	/** @type {PickedSlots} */
	const pickedSlots = {}
	for (const cardId in pickResults) {
		/** @type {PickResultT[]} */
		const resultsForId = pickResults[cardId]
		if (!validPicks(game.state, resultsForId)) return null
		for (let result of resultsForId) {
			if (!validatePickedSlots(game, result.pickedSlots)) return null
			pickedSlots[cardId] = []
			for (let pickedSlot of result.pickedSlots) {
				pickedSlots[cardId].push(pickedSlot)
			}
		}
	}

	return pickedSlots
}
