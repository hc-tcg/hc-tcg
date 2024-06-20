import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse, getSlotPos, rowHasEmptyItemSlot} from '../../../utils/board'
import {discardSingleUse, swapSlots} from '../../../utils/movement'
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

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(
			slot.every(
				slot.player,
				slot.itemSlot,
				slot.rowHasHermit,
				slot.not(slot.locked),
				slot.not(slot.empty),
				(game, pos) => {
					if (!pos.rowIndex || !pos.player.board.activeRow) return false
					return [pos.rowIndex - 1, pos.rowIndex + 1].some((row) => {
						const rowState = pos.player.board.rows[row]
						if (!rowState.hermitCard) return false
						if (rowHasEmptyItemSlot(rowState)) return true
					})
				}
			)
		)
	)

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
				if (!pickResult.card || pickResult.rowIndex === undefined) return

				// Store the row and index of the chosen item
				player.custom[rowIndexKey] = pickResult.rowIndex
				player.custom[itemIndexKey] = pickResult.slot.index

				return
			},
		})
		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an empty item slot on one of your adjacent active or AFK Hermits',
			canPick: slot.every(
				slot.player,
				slot.itemSlot,
				slot.empty,
				slot.rowHasHermit,
				slot.not(slot.locked),
				(game, pick) => {
					const firstRowIndex = player.custom[rowIndexKey]
					return [firstRowIndex - 1, firstRowIndex + 1].includes(pick.rowIndex)
				}
			),
			onResult(pickResult) {
				const pickedIndex = pickResult.rowIndex
				if (pickResult.card || pickedIndex === undefined) return

				const pickedRow = player.board.rows[pickedIndex]
				const firstRowIndex = player.custom[rowIndexKey]
				if (!pickedRow) return
				const firstRow = player.board.rows[firstRowIndex]
				if (!firstRow) return

				// Get the index of the chosen item
				const itemIndex: number = player.custom[itemIndexKey]

				// Make sure we can attach the item
				const itemPos = getSlotPos(player, firstRowIndex, 'item', itemIndex)
				const targetPos = getSlotPos(player, pickedIndex, 'item', pickResult.slot.index)
				const itemCard = firstRow.itemCards[itemIndex]

				const logInfo = pickResult
				logInfo.card = itemPos.row.itemCards[player.custom[itemIndexKey]]

				applySingleUse(game, logInfo)

				// Move the item
				swapSlots(game, itemPos, targetPos)

				delete player.custom[rowIndexKey]
				delete player.custom[itemIndexKey]
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
