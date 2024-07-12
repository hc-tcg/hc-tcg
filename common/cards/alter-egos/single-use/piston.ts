import {GameModel} from '../../../models/game-model'
import {row, slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import {discardSingleUse} from '../../../utils/movement'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class PistonSingleUseCard extends Card {
	firstPickCondition = slot.every(
		slot.currentPlayer,
		slot.itemSlot,
		slot.rowFulfills(row.hasHermit),
		slot.not(slot.frozen),
		slot.not(slot.empty),
		// This condition needs to be different than the one for the second pick request in this case
		// The reason is that we don't know the row that's chosen until after the first pick request is over
		slot.adjacentTo(
			slot.every(slot.rowFulfills(row.hasHermit), slot.itemSlot, slot.empty, slot.not(slot.frozen))
		)
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component
		const itemInstanceKey = this.getInstanceKey(component, 'itemInstance')

		let pickedItemSlot: SlotComponent | null = null

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick an item card from one of your active or AFK Hermits',
			canPick: this.firstPickCondition,
			onResult(pickResult) {
				if (!pickResult.cardId) return

				// Store the component of the chosen item
				pickedItemSlot = pickResult
			},
		})

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick an empty item slot on one of your adjacent active or AFK Hermits',
			canPick: slot.every(
				slot.currentPlayer,
				slot.itemSlot,
				slot.empty,
				slot.rowFulfills(row.hasHermit),
				slot.not(slot.frozen),
				slot.adjacentTo(
					(game, pos) =>
						!!pickedItemSlot?.cardId && slot.hasInstance(pickedItemSlot?.cardId)(game, pos)
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

		player.hooks.afterApply.add(component, () => {
			discardSingleUse(game, player)

			// Remove playing a single use from completed actions so it can be done again
			game.removeCompletedActions('PLAY_SINGLE_USE_CARD')

			player.hooks.afterApply.remove(component)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.afterApply.remove(component)
	}
}

export default PistonSingleUseCard
