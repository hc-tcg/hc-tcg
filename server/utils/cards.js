/**
 * Get the card position for a card instance
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

		// single use slot
		if (board.singleUseCard?.cardInstance === instance) {
			return {
				playerId,
				playerState,
				rowIndex: null,
				rowState: null,
				slotType: 'single_use',
			}
		}

		// go through rows to find instance
		for (let rowIndex = 0; rowIndex < board.rows.length; rowIndex++) {
			const rowState = board.rows[rowIndex]

			if (rowState.hermitCard?.cardInstance === instance) {
				return {
					playerId,
					playerState,
					rowIndex,
					rowState,
					slotType: 'hermit',
				}
			} else if (rowState.effectCard?.cardInstance === instance) {
				return {
					playerId,
					playerState,
					rowIndex,
					rowState,
					slotType: 'effect',
				}
			} else if (
				rowState.itemCards.find((card) => card?.cardInstance === instance)
			) {
				return {
					playerId,
					playerState,
					rowIndex,
					rowState,
					slotType: 'item',
				}
			}
		}
	}
	return null
}
