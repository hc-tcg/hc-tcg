import {GameModel} from '../models/game-model'

/**
 * Get the card position on the board for a card instance
 * @param {GameModel} game
 * @param {string} instance
 * @returns {import("../../common/types/cards").CardPos | null}
 */
export function getCardPos(game, instance) {
	const ids = game.getPlayerIds()
	for (let i = 0; i < ids.length; i++) {
		const playerId = ids[i]
		const playerState = game.state.players[playerId]
		const board = game.state.players[playerId].board

		// go through rows to find instance
		for (let rowIndex = 0; rowIndex < board.rows.length; rowIndex++) {
			const rowState = board.rows[rowIndex]

			if (rowState.hermitCard?.cardInstance === instance) {
				return {
					playerId,
					playerState,
					rowIndex,
					rowState,
					slot: {type: 'hermit', index: 0},
				}
			} else if (rowState.effectCard?.cardInstance === instance) {
				return {
					playerId,
					playerState,
					rowIndex,
					rowState,
					slot: {type: 'effect', index: 0},
				}
			} else {
				for (let i = 0; i < rowState.itemCards.length; i++) {
					const card = rowState.itemCards[i]
					if (card?.cardInstance === instance) {
						return {
							playerId,
							playerState,
							rowIndex,
							rowState,
							slot: {type: 'item', index: i},
						}
					}
				}
			}
		}
	}

	return null
}

/**
 * Get the card position on the board for a card instance
 * @param {GameModel} game
 * @param {import('../../common/types/cards').CardPos} pos
 * @returns {string | null}
 */
export function getCardAtPos(game, pos) {
	const {rowState, slot} = pos

	if (slot.type === 'hermit' && rowState.hermitCard) {
		return rowState.hermitCard.cardInstance
	}

	if (slot.type === 'effect' && rowState.effectCard) {
		return rowState.effectCard.cardInstance
	}

	if (slot.type === 'item' && rowState.itemCards[slot.index]) {
		return rowState.itemCards[slot.index]?.cardInstance || null
	}

	return null
}
