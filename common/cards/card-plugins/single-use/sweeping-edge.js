import SingleUseCard from './_single-use-card'
import {discardCard, isRemovable} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
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
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'

		const {opponentPlayer} = pos
		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return 'NO'

		const rows = opponentPlayer.board.rows
		const targetIndex = [activeRow - 1, activeRow, activeRow + 1].filter(
			(index) => index >= 0 && index < rows.length
		)

		for (const row of targetIndex) {
			const effectCard = rows[row].effectCard
			if (effectCard && isRemovable(effectCard)) return 'YES'
		}

		return 'NO'
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {opponentPlayer} = pos
		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return

		const rows = opponentPlayer.board.rows
		const targetIndex = [activeRow - 1, activeRow, activeRow + 1].filter(
			(index) => index >= 0 && index < rows.length
		)

		for (const index of targetIndex) {
			const effectCard = rows[index].effectCard
			if (effectCard && isRemovable(effectCard)) discardCard(game, effectCard)
		}
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default SweepingEdgeSingleUseCard
