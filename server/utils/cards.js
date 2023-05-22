/**
 * Get the card instance info for a card instance
 * @param {GameModel} game
 * @param {string} instance
 * @returns {InstanceInfo | null}
 */
export function getCardInfo(game, instance) {
	const ids = game.getPlayerIds()
	for (let i = 0; i < ids.length; i++) {
		const playerId = ids[i]
		const playerState = game.state.players[playerId]
		const rows = game.state.players[playerId].board.rows

		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			const rowState = rows[rowIndex]

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
