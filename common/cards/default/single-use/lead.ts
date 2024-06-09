import {CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {
	applySingleUse,
	getActiveRow,
	getActiveRowPos,
	getNonEmptyRows,
	getSlotPos,
	rowHasEmptyItemSlot,
	rowHasItem,
} from '../../../utils/board'
import {canAttachToSlot, swapSlots} from '../../../utils/movement'
import {CanAttachResult} from '../../base/card'
import SingleUseCard from '../../base/single-use-card'

class LeadSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lead',
			numericId: 75,
			name: 'Lead',
			rarity: 'common',
			description:
				"Move one of your opponent's attached item cards from their active Hermit to any of their AFK Hermits.",
			log: (values) =>
				`${values.defaultLog} to move $m${values.pick.name}$ to $o${values.pick.hermitCard}$`,
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		const result = super.canAttach(game, pos)
		const {opponentPlayer} = pos

		const activeRow = getActiveRow(opponentPlayer)
		if (!activeRow || !rowHasItem(activeRow)) return [...result, 'UNMET_CONDITION']

		const afkRows = getNonEmptyRows(opponentPlayer, true)

		const items = activeRow.itemCards
		// Check all afk rows for each item card against all empty slots on that row
		for (let index = 0; index < afkRows.length; index++) {
			const rowPos = afkRows[index]
			if (!rowHasEmptyItemSlot(rowPos.row)) continue

			for (const item of items) {
				if (!item) continue

				for (let i = 0; i < 3; i++) {
					const targetSlot = getSlotPos(opponentPlayer, rowPos.rowIndex, 'item', i)

					if (canAttachToSlot(game, targetSlot, item, true).length > 0) continue

					// We're good to place
					return result
				}
			}
		}

		return [...result, 'UNMET_CONDITION']
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const itemIndexKey = this.getInstanceKey(instance, 'itemIndex')

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: "Pick an item card attached to your opponent's active Hermit",
			onResult(pickResult) {
				if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_INVALID_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (rowIndex !== opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

				// Store the index of the chosen item
				player.custom[itemIndexKey] = pickResult.slot.index

				return 'SUCCESS'
			},
		})
		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: "Pick an empty item slot on one of your opponent's AFK Hermits",
			onResult(pickResult) {
				if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_INVALID_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (rowIndex === opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'
				const row = opponentPlayer.board.rows[rowIndex]
				if (!row) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
				// Slot must be empty
				if (pickResult.card) return 'FAILURE_INVALID_SLOT'

				// Get the index of the chosen item
				const itemIndex: number | undefined = player.custom[itemIndexKey]

				const opponentActivePos = getActiveRowPos(opponentPlayer)

				if (itemIndex === undefined || !opponentActivePos) {
					// Something went wrong, just return success
					// To clarify, the problem here is that if itemIndex is null this pick request will never be able to succeed if we don't do this
					// @TODO is a better failsafe mechanism needed for 2 picks in a row?
					return 'SUCCESS'
				}

				// Make sure we can attach the item
				const itemPos = getSlotPos(opponentPlayer, opponentActivePos.rowIndex, 'item', itemIndex)
				const targetPos = getSlotPos(opponentPlayer, rowIndex, 'item', pickResult.slot.index)
				const itemCard = opponentActivePos.row.itemCards[itemIndex]
				if (canAttachToSlot(game, targetPos, itemCard!, true).length > 0) {
					return 'FAILURE_INVALID_SLOT'
				}

				const logInfo = pickResult
				logInfo.card = itemPos.row.itemCards[player.custom[itemIndexKey]]

				applySingleUse(game, logInfo)

				// Move the item
				swapSlots(game, itemPos, targetPos)

				delete player.custom[itemIndexKey]

				return 'SUCCESS'
			},
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const itemIndexKey = this.getInstanceKey(instance, 'itemIndex')
		delete player.custom[itemIndexKey]
	}
}

export default LeadSingleUseCard
