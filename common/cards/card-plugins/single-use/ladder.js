import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {swapSlots} from '../../../../server/utils/slots'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/cards').SlotPos} SlotPos
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
			pickReqs: [{target: 'player', type: ['hermit'], amount: 1, adjacent: 'active'}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []
			const activeRowIndex = player.board.activeRow

			if (slots.length !== 1 || activeRowIndex === null) return

			const playerActiveRow = player.board.rows[activeRowIndex]

			const inactiveHermitCardInfo = slots[0]
			const inactiveHermitCard = inactiveHermitCardInfo.slot.card

			if (inactiveHermitCard === null || !inactiveHermitCardInfo.row) return

			/** @type {SlotPos} */ const inactivePos = {
				rowIndex: activeRowIndex,
				row: playerActiveRow,
				slot: {
					index: 0,
					type: 'hermit',
				},
			}
			/** @type {SlotPos} */ const activePos = {
				rowIndex: inactiveHermitCardInfo.row.index,
				row: inactiveHermitCardInfo.row.state,
				slot: {
					index: 0,
					type: 'hermit',
				},
			}

			swapSlots(game, activePos, inactivePos)

			player.board.activeRow = inactiveHermitCardInfo.row.index
		}
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default LadderSingleUseCard
