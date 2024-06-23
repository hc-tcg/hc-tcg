import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
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
		slot.not(slot.activeRow),
		slot.not(slot.frozen)
	)

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(this.firstPickCondition),
		slot.someSlotFulfills(this.secondPickCondition)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const itemIndexKey = this.getInstanceKey(instance, 'itemIndex')

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: "Pick an item card attached to your opponent's active Hermit",
			canPick: this.firstPickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.card || pickedSlot.rowIndex === null) return

				// Store the index of the chosen item
				player.custom[itemIndexKey] = pickedSlot
			},
		})

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: "Pick an empty item slot on one of your opponent's AFK Hermits",
			canPick: this.secondPickCondition,
			onResult(pickedSlot) {
				const rowIndex = pickedSlot.rowIndex
				if (pickedSlot.card || rowIndex === null) return

				// Get the index of the chosen item
				const itemIndex: number = player.custom[itemIndexKey]

				const opponentActivePos = getActiveRowPos(opponentPlayer)
				if (!opponentActivePos) return

				applySingleUse(game, pickedSlot)

				// Move the item
				game.swapSlots(player.custom[itemIndexKey], pickedSlot)

				delete player.custom[itemIndexKey]
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
