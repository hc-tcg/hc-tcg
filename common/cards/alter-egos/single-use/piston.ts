import {CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
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

	override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		const {player} = pos

		const result = super.canAttach(game, pos)

		const playerBoard = player.board

		for (let rowIndex = 0; rowIndex < playerBoard.rows.length; rowIndex++) {
			const row = playerBoard.rows[rowIndex]
			if (!row || !row.hermitCard) continue
			if (isRowEmpty(row)) continue

			const adjacentRowsIndex = [rowIndex - 1, rowIndex + 1].filter(
				(index) => index >= 0 && index < playerBoard.rows.length
			)

			const items = row.itemCards
			// for each row, check adjacent rows for each item card against all empty slots on that row
			for (const index of adjacentRowsIndex) {
				const newRow = playerBoard.rows[index]
				if (!newRow.hermitCard) continue
				if (!rowHasEmptyItemSlot(newRow)) continue

				for (const item of items) {
					if (!item) continue

					for (let i = 0; i < 3; i++) {
						const targetSlot = getSlotPos(player, index, 'item', i)

						if (canAttachToSlot(game, targetSlot, item, true).length > 0) continue

						// We're good to place
						return result
					}
				}
			}
		}

		return [...result, 'UNMET_CONDITION']
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const rowIndexKey = this.getInstanceKey(instance, 'rowIndex')
		const itemIndexKey = this.getInstanceKey(instance, 'itemIndex')

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an item card from one of your active or AFK Hermits',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

				// Store the row and index of the chosen item
				player.custom[rowIndexKey] = rowIndex
				player.custom[itemIndexKey] = pickResult.slot.index

				return 'SUCCESS'
			},
		})
		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an empty item slot on one of your adjacent active or AFK Hermits',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'

				const pickedIndex = pickResult.rowIndex
				if (pickedIndex === undefined) return 'FAILURE_INVALID_SLOT'

				// Get the index of the row we chose
				const firstRowIndex: number = player.custom[rowIndexKey]
				const adjacentRows = [firstRowIndex - 1, firstRowIndex + 1]
				// Must be adjacent
				if (!adjacentRows.includes(pickedIndex)) return 'FAILURE_INVALID_SLOT'

				const pickedRow = player.board.rows[pickedIndex]
				if (!pickedRow) return 'FAILURE_INVALID_SLOT'
				const firstRow = player.board.rows[firstRowIndex]
				if (!firstRow) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
				// Slot must be empty
				if (pickResult.card) return 'FAILURE_INVALID_SLOT'

				// Get the index of the chosen item
				const itemIndex: number = player.custom[itemIndexKey]

				// Make sure we can attach the item
				const itemPos = getSlotPos(player, firstRowIndex, 'item', itemIndex)
				const targetPos = getSlotPos(player, pickedIndex, 'item', pickResult.slot.index)
				const itemCard = firstRow.itemCards[itemIndex]
				if (canAttachToSlot(game, targetPos, itemCard!, true).length > 0) {
					return 'FAILURE_INVALID_SLOT'
				}

				const logInfo = pickResult
				logInfo.card = itemPos.row.itemCards[player.custom[itemIndexKey]]

				applySingleUse(game, logInfo)

				// Move the item
				swapSlots(game, itemPos, targetPos)

				// Only add the after apply hook here
				player.hooks.afterApply.add(instance, () => {
					discardSingleUse(game, player)

					// Remove playing a single use from completed actions so it can be done again
					game.removeCompletedActions('PLAY_SINGLE_USE_CARD')

					player.hooks.afterApply.remove(instance)
				})

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
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default PistonSingleUseCard
