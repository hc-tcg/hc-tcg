import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {SlotPos} from '../../types/cards'
import {canAttachToCard, getAdjacentRows, rowHasEmptyItemSlot, rowHasItem} from '../../utils/board'
import {discardSingleUse, swapSlots} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class PistonSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'piston',
			name: 'Piston',
			rarity: 'common',
			description:
				'Move 1 of your attached item cards to an adjacent active or AFK Hermit. You can use another single use effect card this turn.',
			pickOn: 'apply',
			pickReqs: [
				{target: 'player', slot: ['item'], type: ['item'], amount: 1},
				{
					target: 'player',
					slot: ['item'],
					amount: 1,
					empty: true,
					adjacent: 'req',
				},
			],
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const adjacents = getAdjacentRows(pos.player)
		let validPairs = 0
		for (const rows of adjacents) {
			let valid = false
			if (rowHasItem(rows[0]) && rowHasEmptyItemSlot(rows[1])) {
				for (const item of rows[0].itemCards) {
					if (canAttachToCard(game, rows[1].hermitCard, item)) {
						valid = true
						break
					}
				}
			}
			if (rowHasItem(rows[1]) && rowHasEmptyItemSlot(rows[0]) && !valid) {
				for (const item of rows[1].itemCards) {
					if (canAttachToCard(game, rows[0].hermitCard, item)) {
						valid = true
						break
					}
				}
			}

			if (valid) validPairs++
		}
		if (validPairs) return 'YES'

		return 'NO'
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

			const itemPos: SlotPos = {
				rowIndex: itemCardInfo.row.index,
				row: itemCardInfo.row.state,
				slot: {
					index: itemCardInfo.slot.index,
					type: 'item',
				},
			}

			const targetPos: SlotPos = {
				rowIndex: targetSlotInfo.row.index,
				row: targetSlotInfo.row.state,
				slot: {
					index: targetSlotInfo.slot.index,
					type: 'item',
				},
			}

			swapSlots(game, itemPos, targetPos)
		})

		player.hooks.afterApply.add(instance, (pickedSlots, modalResult) => {
			discardSingleUse(game, player)

			// Remove playing a single use from completed actions so it can be done again
			game.removeCompletedActions('PLAY_SINGLE_USE_CARD')

			player.hooks.onApply.remove(instance)
			player.hooks.afterApply.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.remove(instance)
		player.hooks.afterApply.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default PistonSingleUseCard
