import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {SlotInfo} from '../../../types/cards'
import {CardInstance} from '../../../types/game-state'
import {applySingleUse} from '../../../utils/board'
import {discardSingleUse} from '../../../utils/movement'
import Card, {SingleUse, singleUse} from '../../base/card'

class PistonSingleUseCard extends Card {
	firstPickCondition = slot.every(
		slot.player,
		slot.itemSlot,
		slot.rowHasHermit,
		slot.not(slot.frozen),
		slot.not(slot.empty),
		// This condition needs to be different than the one for the second pick request in this case
		// The reason is that we don't know the row that's chosen until after the first pick request is over
		slot.adjacentTo(slot.every(slot.rowHasHermit, slot.itemSlot, slot.empty, slot.not(slot.frozen)))
	)

	props: SingleUse = {
		...singleUse,
		id: 'piston',
		numericId: 144,
		name: 'Piston',
		expansion: 'alter_egos',
		rarity: 'common',
		tokens: 0,
		description:
			'Move one of your attached item cards to an adjacent Hermit.\nYou can use another single use effect card this turn.',
		attachCondition: slot.every(
			singleUse.attachCondition,
			slot.someSlotFulfills(this.firstPickCondition)
		),
		log: (values) => `${values.defaultLog} to move $m${values.pick.name}$`,
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		const itemInstanceKey = this.getInstanceKey(instance, 'itemInstance')

		let pickedItemSlot: SlotInfo | null = null

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick an item card from one of your active or AFK Hermits',
			canPick: this.firstPickCondition,
			onResult(pickResult) {
				if (!pickResult.cardId) return

				// Store the instance of the chosen item
				pickedItemSlot = pickResult
			},
		})

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick an empty item slot on one of your adjacent active or AFK Hermits',
			canPick: slot.every(
				slot.player,
				slot.itemSlot,
				slot.empty,
				slot.rowHasHermit,
				slot.not(slot.frozen),
				slot.adjacentTo(
					(game, pos) => !!pickedItemSlot?.cardId && slot.hasInstance(pickedItemSlot?.cardId)(game, pos)
				)
			),
			onResult(pickedSlot) {
				const logInfo = pickedSlot
				if (pickedItemSlot !== null && pickedItemSlot.cardId !== null) {
					logInfo.cardId = pickedItemSlot.cardId
				}

				// Move the card and apply su card
				game.swapSlots(pickedItemSlot, pickedSlot, true)
				applySingleUse(game, logInfo)
			},
		})

		player.hooks.afterApply.add(instance, () => {
			discardSingleUse(game, player)

			// Remove playing a single use from completed actions so it can be done again
			game.removeCompletedActions('PLAY_SINGLE_USE_CARD')

			player.hooks.afterApply.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterApply.remove(instance)
	}
}

export default PistonSingleUseCard
