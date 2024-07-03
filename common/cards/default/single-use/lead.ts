import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {SlotInfo} from '../../../types/cards'
import {CardInstance} from '../../../types/game-state'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import Card, {SingleUse, singleUse} from '../../base/card'

class LeadSingleUseCard extends Card {
	firstPickCondition = slot.every(
		slot.opponent,
		slot.itemSlot,
		slot.not(slot.empty),
		slot.activeRow,
		slot.not(slot.frozen)
	)
	secondPickCondition = slot.every(
		slot.opponent,
		slot.itemSlot,
		slot.empty,
		slot.rowHasHermit,
		slot.not(slot.activeRow),
		slot.not(slot.frozen)
	)

	props: SingleUse = {
		...singleUse,
		id: 'lead',
		numericId: 75,
		name: 'Lead',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		description:
			"Move one of your opponent's attached item cards from their active Hermit to any of their AFK Hermits.",
		log: (values) =>
			`${values.defaultLog} to move $m${values.pick.name}$ to $o${values.pick.hermitCard}$`,
		attachCondition: slot.every(
			singleUse.attachCondition,
			slot.someSlotFulfills(this.firstPickCondition),
			slot.someSlotFulfills(this.secondPickCondition)
		),
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		let itemSlot: SlotInfo | null = null

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: "Pick an item card attached to your opponent's active Hermit",
			canPick: this.firstPickCondition,
			onResult(pickedSlot) {
				itemSlot = pickedSlot
			},
		})

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: "Pick an empty item slot on one of your opponent's AFK Hermits",
			canPick: this.secondPickCondition,
			onResult(pickedSlot) {
				const rowIndex = pickedSlot.rowIndex
				if (pickedSlot.card || rowIndex === null) return

				// Get the index of the chosen item
				const opponentActivePos = getActiveRowPos(opponentPlayer)
				if (!opponentActivePos) return

				applySingleUse(game, pickedSlot)

				// Move the item
				game.swapSlots(itemSlot, pickedSlot)
			},
		})
	}
}

export default LeadSingleUseCard
