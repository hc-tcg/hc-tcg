import {CARDS} from '../..'
import {CardPosModel, getCardPos} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {callSlotConditionWithCardPosModel, slot} from '../../../slot'
import {
	applySingleUse,
	getActiveRow,
	getActiveRowPos,
	getNonEmptyRows,
	getSlotPos,
	isRowEmpty,
	rowHasEmptyItemSlot,
	rowHasItem,
} from '../../../utils/board'
import {canAttachToSlot, swapSlots} from '../../../utils/movement'
import {CanAttachResult} from '../../base/card'
import SingleUseCard from '../../base/single-use-card'

const firstPickCondition = slot.every(slot.opponent, slot.itemSlot, slot.not(slot.empty), slot.activeRow)
const secondPickCondition = slot.every(slot.opponent, slot.itemSlot, slot.empty, slot.not(slot.activeRow))

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

	public override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFullfills(firstPickCondition),
		slot.someSlotFullfills(secondPickCondition),
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const itemIndexKey = this.getInstanceKey(instance, 'itemIndex')

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: "Pick an item card attached to your opponent's active Hermit",
			canPick: firstPickCondition,
			onResult(pickResult) {
				if (!pickResult.card || pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

				// Store the index of the chosen item
				player.custom[itemIndexKey] = pickResult.slot.index

				return 'SUCCESS'
			},
		})
		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: "Pick an empty item slot on one of your opponent's AFK Hermits",
			canPick: secondPickCondition,
			onResult(pickResult) {
				const rowIndex = pickResult.rowIndex
				if (pickResult.card || rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

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
				if (canAttachToSlot(game, targetPos, itemCard!)) {
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
