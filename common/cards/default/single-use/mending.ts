import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse, getActiveRow} from '../../../utils/board'
import {discardSingleUse} from '../../../utils/movement'
import singleUseCard from '../../base/single-use-card'

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

	pickCondition = slot.every(
		slot.player,
		slot.effectSlot,
		slot.empty,
		slot.rowHasHermit,
		slot.not(slot.frozen),
		slot.not(slot.activeRow)
	)

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(this.pickCondition),
		slot.someSlotFulfills(
			slot.every(slot.activeRow, slot.effectSlot, slot.not(slot.frozen), slot.not(slot.empty))
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
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				const hermitActiveEffectCard = game.findSlot(
					slot.every(slot.player, slot.activeRow, slot.effectSlot)
				)

				if (!hermitActiveEffectCard || !hermitActiveEffectCard.row) return

				const logInfo = pickedSlot
				logInfo.card = hermitActiveEffectCard.row.effectCard

				// Apply the mending card
				applySingleUse(game, logInfo)

				// Move the effect card
				game.swapSlots(hermitActiveEffectCard, pickedSlot)
			},
		})
	}
}

export default MendingSingleUseCard
