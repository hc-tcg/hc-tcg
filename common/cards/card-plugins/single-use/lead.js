import SingleUseCard from './_single-use-card'
import {rowHasItem, getRowsWithEmptyItemsSlots} from '../../../../server/utils'
import {validPick} from '../../../../server/utils/reqs'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 *
 */

/*
Last lead version:
EP50 23:05
*/
class LeadSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lead',
			name: 'Lead',
			rarity: 'common',
			description:
				"Move 1 of your opponent's active Hermit item cards to any of their AFK Hermits.\n\nReceiving Hermit must have open item card slot.",
		})
		this.pickOn = 'apply'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'opponent', type: ['item'], amount: 1, active: true},
			{
				target: 'opponent',
				type: ['item'],
				amount: 1,
				empty: true,
				active: false,
			},
		])
	}

	// @TODO waiting on new pickedSlot types

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('common/types/pick-process').PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {singleUseInfo} = game.ds
		if (singleUseInfo?.id !== this.id) return false

		const pickedCards = pickedSlots[this.id] || []
		if (pickedCards.length !== 2) return false

		const itemCardInfo = pickedCards[0]
		const targetSlotInfo = pickedCards[1]
		if (!validPick(game.state, this.pickReqs[0], itemCardInfo)) return false
		if (targetSlotInfo.card !== null) return false
		if (!validPick(game.state, this.pickReqs[1], targetSlotInfo)) return false

		// remove item from source
		itemCardInfo.row.itemCards[itemCardInfo.slotIndex] = null

		// add item to target
		targetSlotInfo.row.itemCards[targetSlotInfo.slotIndex] = itemCardInfo.card

		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (pos.slot.type !== 'single_use') return 'INVALID'

		const {opponentPlayer, opponentActiveRow} = game.ds

		if (!opponentActiveRow || !rowHasItem(opponentActiveRow)) return 'NO'
		if (getRowsWithEmptyItemsSlots(opponentPlayer, false).length === 0)
			return 'NO'

		return 'YES'
	}
}

export default LeadSingleUseCard
