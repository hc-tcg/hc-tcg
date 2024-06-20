import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse, getActiveRow, getSlotPos} from '../../../utils/board'
import {discardSingleUse, swapSlots} from '../../../utils/movement'
import singleUseCard from '../../base/single-use-card'

const pickCondition = slot.every(
	slot.player,
	slot.effectSlot,
	slot.empty,
	slot.not(slot.locked),
	slot.rowHasHermit,
	slot.not(slot.activeRow)
)

class MendingSingleUseCard extends singleUseCard {
	constructor() {
		super({
			id: 'mending',
			numericId: 78,
			name: 'Mending',
			rarity: 'ultra_rare',
			description: "Move your active Hermit's attached effect card to any of your AFK Hermits.",
			log: (values) =>
				`${values.defaultLog} to move $e${values.pick.name}$ to $p${values.pick.hermitCard}$`,
		})
	}

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(pickCondition),
		slot.someSlotFulfills(
			slot.every(slot.activeRow, slot.effectSlot, slot.not(slot.locked), slot.not(slot.empty))
		)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		const activeRowIndex = player.board.activeRow
		if (activeRowIndex === null) {
			discardSingleUse(game, player)
			return
		}

		const activeRow = getActiveRow(player)
		if (!activeRow) {
			discardSingleUse(game, player)
			return
		}
		const effectCard = activeRow.effectCard
		if (!effectCard) {
			discardSingleUse(game, player)
			return
		}

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an empty effect slot from one of your AFK Hermits',
			canPick: pickCondition,
			onResult(pickResult) {
				const rowIndex = pickResult.rowIndex
				if (pickResult.card || rowIndex === undefined) return

				const sourcePos = getSlotPos(player, activeRowIndex, 'effect')
				const targetPos = getSlotPos(player, rowIndex, 'effect')

				const logInfo = pickResult
				logInfo.card = sourcePos.row.effectCard

				// Apply the mending card
				applySingleUse(game, logInfo)

				// Move the effect card
				swapSlots(game, sourcePos, targetPos)
			},
		})
	}
}

export default MendingSingleUseCard
