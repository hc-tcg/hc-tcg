import SingleUseCard from './_single-use-card'
import {rowHasItem, getRowsWithEmptyItemsSlots} from '../../../../server/utils'
import {swapSlots} from '../../../../server/utils/slots'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'

/**
 * @typedef {import('common/types/cards').SlotPos} SlotPos
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class LeadSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lead',
			name: 'Lead',
			rarity: 'common',
			description:
				"Move 1 of your opponent's active Hermit item cards to any of their AFK Hermits.\n\nReceiving Hermit must have open item card slot.",
			pickOn: 'apply',
			pickReqs: [
				{target: 'opponent', type: ['item'], amount: 1, active: true},
				{
					target: 'opponent',
					type: ['item'],
					amount: 1,
					empty: true,
					active: false,
				},
			],
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
			if (slots.length !== 2) return

			const itemCardInfo = slots[0]
			const targetSlotInfo = slots[1]
			if (targetSlotInfo.slot.card !== null || !itemCardInfo.row || !targetSlotInfo.row) return

			/** @type {SlotPos} */ const itemPos = {
				rowIndex: itemCardInfo.row.index,
				row: itemCardInfo.row.state,
				slot: {
					index: itemCardInfo.slot.index,
					type: 'item',
				},
			}

			/** @type {SlotPos} */ const targetPos = {
				rowIndex: targetSlotInfo.row.index,
				row: targetSlotInfo.row.state,
				slot: {
					index: targetSlotInfo.slot.index,
					type: 'item',
				},
			}

			swapSlots(game, itemPos, targetPos)

			return true
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'

		const {opponentPlayer, opponentActiveRow} = game.ds

		if (!opponentActiveRow || !rowHasItem(opponentActiveRow)) return 'NO'
		if (getRowsWithEmptyItemsSlots(opponentPlayer, false).length === 0) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}
}

export default LeadSingleUseCard
