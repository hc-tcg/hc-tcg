import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse} from '../../../utils/board'
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
				slot.not(slot.frozen),
				slot.not(slot.empty),
				slot.adjacentTo(
					slot.every(slot.rowHasHermit, slot.itemSlot, slot.empty, slot.not(slot.frozen))
				)
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
				if (!pickResult.card || pickResult.rowIndex === null) return

				// Store the row and index of the chosen item
				player.custom[rowIndexKey] = pickResult.rowIndex
				player.custom[itemIndexKey] = pickResult.index

				return
			},
		})

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an empty item slot on one of your adjacent active or AFK Hermits',
			// Note: This lambda function allows player.custom[rowIndexKey] to be defined before we generate the condition.
			// This will be fixed when player.custom is removed.
			canPick: (game, pos) =>
				slot.every(
					slot.player,
					slot.itemSlot,
					slot.empty,
					slot.rowHasHermit,
					slot.not(slot.frozen),
					slot.adjacentTo(slot.rowIndex(player.custom[rowIndexKey]))
				)(game, pos),
			onResult(pickResult) {
				const pickedIndex = pickResult.rowIndex
				if (pickResult.card || pickedIndex === null) return

				const pickedRow = player.board.rows[pickedIndex]
				const firstRowIndex = player.custom[rowIndexKey]
				if (!pickedRow) return
				const firstRow = player.board.rows[firstRowIndex]
				if (!firstRow) return

				// Get the index of the chosen item
				const itemIndex: number = player.custom[itemIndexKey]

				const itemPos = game.findSlot(
					slot.every(
						slot.player,
						slot.rowIndex(firstRowIndex),
						slot.itemSlot,
						slot.index(itemIndex)
					)
				)
				const targetPos = game.findSlot(
					slot.every(
						slot.player,
						slot.rowIndex(pickedIndex),
						slot.itemSlot,
						slot.index(pickResult.index)
					)
				)

				const itemCard = firstRow.itemCards[itemIndex]

				const logInfo = pickResult
				if (itemPos !== null && itemPos.row !== null) {
					logInfo.card = itemPos.row.itemCards[player.custom[itemIndexKey]]
				}

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
