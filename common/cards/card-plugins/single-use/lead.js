import SingleUseCard from './_single-use-card'
import {
	rowHasItem,
	getRowsWithEmptyItemsSlots,
	canAttachToCard,
	getNonEmptyRows,
	getActiveRow,
} from '../../../../server/utils'
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
				{
					target: 'opponent',
					slot: ['item'],
					type: ['item'],
					amount: 1,
					active: true,
				},
				{
					target: 'opponent',
					slot: ['item'],
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

			const hermitCard = targetSlotInfo.row.state.hermitCard
			const itemCard = itemCardInfo.slot.card
			if (!canAttachToCard(game, hermitCard, itemCard)) return

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

		const {opponentPlayer} = pos

		const activeRow = getActiveRow(opponentPlayer)
		if (!activeRow || !rowHasItem(activeRow)) return 'NO'
		const rowsWithEmptySlots = getRowsWithEmptyItemsSlots(opponentPlayer, false)
		if (rowsWithEmptySlots.length === 0) return 'NO'

		// check if the effect card can be attached to any of the inactive hermits
		for (const row of rowsWithEmptySlots) {
			for (const item of activeRow.itemCards) {
				if (canAttachToCard(game, row.hermitCard, item)) return 'YES'
			}
		}

		return 'NO'
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
