import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {SlotInfo} from '../../../types/cards'
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
		const itemKey = this.getInstanceKey(instance, 'itemKey')

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an item card from one of your active or AFK Hermits',
			canPick: slot.every(slot.player, slot.itemSlot, slot.not(slot.empty)),
			onResult(pickedSlot) {
				if (!pickedSlot.card || pickedSlot.rowIndex === null) return

				// Store the row and index of the chosen item
				player.custom[itemKey] = pickedSlot

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
					slot.adjacentTo(slot.rowIndex((player.custom[itemKey] as SlotInfo).rowIndex))
				)(game, pos),
			onResult(pickedSlot) {
				const pickedIndex = pickedSlot.rowIndex
				if (pickedSlot.card || pickedIndex === null) return

				const itemSlotInfo = player.custom[itemKey]

				applySingleUse(game, pickedSlot)

				// Move the item
				swapSlots(game, itemSlotInfo, pickedSlot)

				delete player.custom[itemKey]
			},
			onCancel() {
				delete player.custom[itemKey]
			},
			onTimeout() {
				delete player.custom[itemKey]
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
		const itemKey = this.getInstanceKey(instance, 'itemKey')

		player.hooks.afterApply.remove(instance)
		delete player.custom[itemKey]
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default PistonSingleUseCard
