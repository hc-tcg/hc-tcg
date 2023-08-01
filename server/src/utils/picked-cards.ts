import {PickResultT, PickedSlotT, PickedSlots} from 'common/types/pick-process'
import {GameModel} from 'common/models/game-model'
import {validPicks} from './reqs'
import {equalCard} from 'common/utils/cards'

/**
 * @param {GameModel} game
 * @param {PickedSlotT[]} pickedSlots
 * @returns {PickedSlotT[] | null}
 */
export function validatePickedSlots(
	game: GameModel,
	pickedSlots: PickedSlotT[]
): PickedSlotT[] | null {
	const validPickedSlots: PickedSlotT[] = []
	for (const pickedSlot of pickedSlots) {
		const {type, card, index} = pickedSlot.slot
		if (!game.state.order.includes(pickedSlot.playerId)) return null

		const player = game.state.players[pickedSlot.playerId]
		if (!['hand', 'hermit', 'effect', 'item'].includes(type)) return null
		if (type === 'hand' && card) {
			if (!equalCard(player.hand[index], card)) return null
		} else if (['hermit', 'effect', 'item'].includes(type) && pickedSlot.row) {
			const {hermitCard, effectCard, itemCards} = player.board.rows[pickedSlot.row.index]
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

export function getPickedSlots(game: GameModel, turnAction: any): PickedSlots | null {
	if (!turnAction.payload || !turnAction.payload.pickResults) return {}
	const pickResults = turnAction.payload.pickResults

	/** @type {PickedSlots} */
	const pickedSlots: PickedSlots = {}
	for (const cardId in pickResults) {
		/** @type {PickResultT[]} */
		const resultsForId: PickResultT[] = pickResults[cardId]
		if (!validPicks(game.state, resultsForId)) return null
		for (let result of resultsForId) {
			const validPickedSlots = validatePickedSlots(game, result.pickedSlots)
			if (!validPickedSlots) return null
			if (!pickedSlots[cardId]) pickedSlots[cardId] = []
			for (let pickedSlot of validPickedSlots) {
				pickedSlots[cardId].push(pickedSlot)
			}
		}
	}

	return pickedSlots
}
