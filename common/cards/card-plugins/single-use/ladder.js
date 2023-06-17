import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {swapSlots} from '../../../../server/utils/slots'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/slots').SlotPos} SlotPos
 */

class LadderSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ladder',
			name: 'Ladder',
			rarity: 'ultra_rare',
			description:
				'Swap your active Hermit card with one of your adjacent AFK Hermits.\n\nAll cards attached to both Hermits, including health, remain in place.\n\nActive and AFK status does not change.',

			pickOn: 'apply',
			pickReqs: [
				{target: 'player', type: ['hermit'], amount: 1, adjacent: 'active'},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const slots = pickedSlots[this.id] || []
		const activeRowIndex = pos.player.board.activeRow

		if (slots.length !== 1 || activeRowIndex === null) return

		const playerActiveRow = pos.player.board.rows[activeRowIndex]

		const activeHermitCard = playerActiveRow?.hermitCard
		const inactiveHermitCardInfo = slots[0]
		const inactiveHermitCard = inactiveHermitCardInfo.slot.card

		if (inactiveHermitCard === null || !inactiveHermitCardInfo.row) return

		/** @type {SlotPos} */ const inactivePos = {
			index: 0,
			type: 'hermit',
			row: playerActiveRow,
		}
		/** @type {SlotPos} */ const activePos = {
			index: 0,
			type: 'hermit',
			row: inactiveHermitCardInfo.row.state,
		}

		swapSlots(game, activePos, inactivePos)
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'

		const playerBoard = pos.player.board
		const activeRowIndex = playerBoard.activeRow
		if (activeRowIndex === null) return 'NO'

		const adjacentRowsIndex = [activeRowIndex - 1, activeRowIndex + 1].filter(
			(index) => index >= 0 && index < playerBoard.rows.length
		)
		for (const index of adjacentRowsIndex) {
			const row = playerBoard.rows[index]
			if (row.hermitCard !== null) return 'YES'
		}

		return 'NO'
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default LadderSingleUseCard
