import {CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot, SlotCondition} from '../../../slot'
import {applySingleUse, getSlotPos, isRowEmpty, rowHasEmptyItemSlot} from '../../../utils/board'
import {canAttachToSlot, discardSingleUse, swapSlots} from '../../../utils/movement'
import {CanAttachResult} from '../../base/card'
import SingleUseCard from '../../base/single-use-card'

class PistonSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'piston',
			numericId: 144,
			name: 'Piston',
			rarity: 'common',
			description:
				'Move one of your attached item cards to an adjacent Hermit.\nYou can use another single use effect card this turn.',
			log: (values) => `${values.defaultLog} to move $m${values.pick.name}$`,
		})
	}

	override _attachCondition = slot.every(super.attachCondition, (game, pos) => {
		return pos.player.board.rows.some((row, rowIndex) => {
			if (!row || !row.hermitCard) return false
			if (isRowEmpty(row)) return false

			const adjacentRowsIndex = [rowIndex - 1, rowIndex + 1].filter(
				(index) => index >= 0 && index < pos.player.board.rows.length
			)

			const items = row.itemCards
			// for each row, check adjacent rows for each item card against all empty slots on that row
			for (const index of adjacentRowsIndex) {
				const newRow = pos.player.board.rows[index]
				if (!newRow.hermitCard) return false
				if (!rowHasEmptyItemSlot(newRow)) return false

				for (const item of items) {
					if (!item) return false

					for (let i = 0; i < 3; i++) {
						const targetSlot = getSlotPos(pos.player, index, 'item', i)

						if (canAttachToSlot(game, targetSlot, item)) return false

						// We're good to place
						return true
					}
				}
			}
		})
	})

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const rowIndexKey = this.getInstanceKey(instance, 'rowIndex')
		const itemIndexKey = this.getInstanceKey(instance, 'itemIndex')

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an item card from one of your active or AFK Hermits',
			canPick: slot.every(slot.player, slot.itemSlot, slot.not(slot.empty)),
			onResult(pickResult) {
				if (!pickResult.card || pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

				// Store the row and index of the chosen item
				player.custom[rowIndexKey] = pickResult.rowIndex
				player.custom[itemIndexKey] = pickResult.slot.index

				return 'SUCCESS'
			},
		})
		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an empty item slot on one of your adjacent active or AFK Hermits',
			canPick: slot.every(slot.player, slot.itemSlot, slot.empty, (game, pick) => {
				const firstRowIndex = player.custom[rowIndexKey]
				return [firstRowIndex - 1, firstRowIndex + 1].includes(pick.rowIndex)
			}),
			onResult(pickResult) {
				const pickedIndex = pickResult.rowIndex
				if (pickResult.card || pickedIndex === undefined) return 'FAILURE_INVALID_SLOT'

				const pickedRow = player.board.rows[pickedIndex]
				const firstRowIndex = player.custom[rowIndexKey]
				if (!pickedRow) return 'FAILURE_INVALID_SLOT'
				const firstRow = player.board.rows[firstRowIndex]
				if (!firstRow) return 'FAILURE_INVALID_SLOT'

				// Get the index of the chosen item
				const itemIndex: number = player.custom[itemIndexKey]

				// Make sure we can attach the item
				const itemPos = getSlotPos(player, firstRowIndex, 'item', itemIndex)
				const targetPos = getSlotPos(player, pickedIndex, 'item', pickResult.slot.index)
				const itemCard = firstRow.itemCards[itemIndex]
				if (canAttachToSlot(game, targetPos, itemCard!)) {
					return 'FAILURE_INVALID_SLOT'
				}

				const logInfo = pickResult
				logInfo.card = itemPos.row.itemCards[player.custom[itemIndexKey]]

				applySingleUse(game, logInfo)

				// Move the item
				swapSlots(game, itemPos, targetPos)

				delete player.custom[rowIndexKey]
				delete player.custom[itemIndexKey]

				return 'SUCCESS'
			},
			onCancel() {
				delete player.custom[rowIndexKey]
				delete player.custom[itemIndexKey]
			},
			onTimeout() {
				delete player.custom[rowIndexKey]
				delete player.custom[itemIndexKey]
			},
		})

		player.hooks.afterApply.add(instance, () => {
			discardSingleUse(game, player)

			// Remove playing a single use from completed actions so it can be done again
			game.removeCompletedActions('PLAY_SINGLE_USE_CARD')

			player.hooks.afterApply.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterApply.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default PistonSingleUseCard
