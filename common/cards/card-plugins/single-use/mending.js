import singleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {swapSlots} from '../../../../server/utils/slots'
import {getNonEmptyRows, isRemovable} from '../../../../server/utils'

/**
 * @typedef {import('common/types/cards').SlotPos} SlotPos
 */

class MendingSingleUseCard extends singleUseCard {
	constructor() {
		super({
			id: 'mending',
			name: 'Mending',
			rarity: 'ultra_rare',
			description:
				'Move any attached effect card from your active Hermit to an AFK Hermit.',
			pickOn: 'apply',
			pickReqs: [
				{
					target: 'player',
					type: ['effect'],
					amount: 1,
					empty: true,
				},
			],
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onApply[instance] = (pickedSlots) => {
			const pickedCards = pickedSlots[this.id] || []

			if (pickedCards.length !== 1) return

			const targetSlotInfo = pickedCards[0]
			const {player} = pos
			if (player.board.activeRow === null || !targetSlotInfo.row) return
			const playerActiveRow = player.board.rows[player.board.activeRow]
			if (
				targetSlotInfo.row.state.effectCard !== null ||
				!playerActiveRow.effectCard
			)
				return

			// swap slots
			/** @type {SlotPos} */ const sourcePos = {
				rowIndex: player.board.activeRow,
				row: playerActiveRow,
				slot: {
					index: 0,
					type: 'effect',
				},
			}

			/** @type {SlotPos} */ const targetPos = {
				rowIndex: targetSlotInfo.row.index,
				row: targetSlotInfo.row.state,
				slot: {
					index: targetSlotInfo.slot.index,
					type: 'effect',
				},
			}

			swapSlots(game, sourcePos, targetPos)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos

		if (player.board.activeRow === null) return 'NO'

		const effectCard = player.board.rows[player.board.activeRow].effectCard
		if (!effectCard || !isRemovable(effectCard)) return 'NO'

		// check if there is an empty slot available to move the effect card to
		const inactiveHermits = getNonEmptyRows(player, false)
		for (const hermit of inactiveHermits) {
			const effect = hermit.row.effectCard
			if (!effect || isRemovable(effect)) return 'YES'
		}

		return 'NO'
	}
}

export default MendingSingleUseCard
