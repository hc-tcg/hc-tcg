import {GameModel} from '../models/game-model'
import {CardPos} from '..//models/card-pos-model'

/**
 * Get the card position on the board for a card instance
 * @param {GameModel} game
 * @param {string} instance
 * @returns {CardPos | null}
 */
export function getCardPos(game, instance) {
	const ids = game.getPlayerIds()
	for (let i = 0; i < ids.length; i++) {
		const playerId = ids[i]
		const player = game.state.players[playerId]

		const opponentPlayerId = ids.find((id) => id !== playerId)
		if (!opponentPlayerId) continue
		const opponentPlayer = game.state.players[opponentPlayerId]

		const board = game.state.players[playerId].board

		// single use slot
		if (board.singleUseCard?.cardInstance === instance) {
			return new CardPos(player, opponentPlayer, instance, null, {
				type: 'single_use',
				index: 0,
			})
		}

		// go through rows to find instance
		for (let rowIndex = 0; rowIndex < board.rows.length; rowIndex++) {
			const row = board.rows[rowIndex]

			if (row.hermitCard?.cardInstance === instance) {
				return new CardPos(player, opponentPlayer, instance, rowIndex, {
					type: 'hermit',
					index: 0,
				})
			} else if (row.effectCard?.cardInstance === instance) {
				return new CardPos(player, opponentPlayer, instance, rowIndex, {
					type: 'effect',
					index: 0,
				})
			} else {
				for (let i = 0; i < row.itemCards.length; i++) {
					const card = row.itemCards[i]
					if (card?.cardInstance === instance) {
						return new CardPos(player, opponentPlayer, instance, rowIndex, {
							type: 'item',
							index: i,
						})
					}
				}
			}
		}
	}

	return null
}
