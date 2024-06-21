import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse, getActiveRowPos, getSlotPos} from '../../../utils/board'
import {swapSlots} from '../../../utils/movement'
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
			onResult(pickResult) {
				if (!pickResult.card || pickResult.rowIndex === undefined) return

				// Store the index of the chosen item
				player.custom[itemIndexKey] = pickResult.slot.index
			},
		})
		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: "Pick an empty item slot on one of your opponent's AFK Hermits",
			canPick: this.secondPickCondition,
			onResult(pickResult) {
				const rowIndex = pickResult.rowIndex
				if (pickResult.card || rowIndex === undefined) return

				// Get the index of the chosen item
				const itemIndex: number = player.custom[itemIndexKey]

				const opponentActivePos = getActiveRowPos(opponentPlayer)
				if (!opponentActivePos) return

				// Make sure we can attach the item
				const itemPos = getSlotPos(opponentPlayer, opponentActivePos.rowIndex, 'item', itemIndex)
				const targetPos = getSlotPos(opponentPlayer, rowIndex, 'item', pickResult.slot.index)

				const logInfo = pickResult
				logInfo.card = itemPos.row.itemCards[player.custom[itemIndexKey]]

				applySingleUse(game, logInfo)

				// Move the item
				swapSlots(game, itemPos, targetPos)

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
