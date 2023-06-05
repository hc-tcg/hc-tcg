import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../../server/utils'

/**
* @typedef {import('../../../../server/models/game-model').GameModel} GameModel
* @typedef {import('../../../types/cards').CardPos} CardPos
* @typedef {import('../../../types/pick-process').PickedSlotsInfo} PickedSlotsInfo
*/

class SweepingEdgeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'sweeping_edge',
			name: 'Sweeping Edge',
			rarity: 'ultra_rare',
			description:
				'Opponent must discard any effect cards attached to their active Hermit and adjacent Hermits.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'NO') return 'INVALID'
		const {opponentPlayer} = game.ds

		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return 'INVALID'

		const rows = opponentPlayer.board.rows
		const targetIndex = [
			activeRow - 1,
			activeRow,
			activeRow + 1
		].filter((index) => index >= 0 && index < rows.length)

		for (const row of targetIndex) {
			if (rows[row].effectCard) return 'YES'
		}

		return 'INVALID'
	}
	
	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {PickedSlotsInfo} pickedSlots
	 */
	onApply(game, instance, pickedSlots) {
		const {opponentPlayer} = game.ds

		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return

		const rows = opponentPlayer.board.rows
		const targetIndex = [
			activeRow - 1,
			activeRow,
			activeRow + 1
		].filter((index) => index >= 0 && index < rows.length)

		for (const index of targetIndex) {
			discardCard(game, rows[index].effectCard)
		}
	}
}

export default SweepingEdgeSingleUseCard
