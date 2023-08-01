import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {SlotPos} from '../../types/cards'
import {
	canAttachToCard,
	getActiveRow,
	getRowsWithEmptyItemsSlots,
	rowHasItem,
} from '../../utils/board'
import {swapSlots} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

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

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []
			if (slots.length !== 2) return

			const itemCardInfo = slots[0]
			const targetSlotInfo = slots[1]
			if (targetSlotInfo.slot.card !== null || !itemCardInfo.row || !targetSlotInfo.row) return

			const hermitCard = targetSlotInfo.row.state.hermitCard
			const itemCard = itemCardInfo.slot.card
			if (!canAttachToCard(game, hermitCard, itemCard)) return

			/** @type {SlotPos} */ const itemPos: SlotPos = {
				rowIndex: itemCardInfo.row.index,
				row: itemCardInfo.row.state,
				slot: {
					index: itemCardInfo.slot.index,
					type: 'item',
				},
			}

			/** @type {SlotPos} */ const targetPos: SlotPos = {
				rowIndex: targetSlotInfo.row.index,
				row: targetSlotInfo.row.state,
				slot: {
					index: targetSlotInfo.slot.index,
					type: 'item',
				},
			}

			swapSlots(game, itemPos, targetPos)

			return true
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
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

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default LeadSingleUseCard
