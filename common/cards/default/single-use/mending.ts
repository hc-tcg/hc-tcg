import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardInstance} from '../../../types/game-state'
import {applySingleUse} from '../../../utils/board'
import Card, {SingleUse, singleUse} from '../../base/card'

class MendingSingleUseCard extends Card {
	pickCondition = slot.every(
		slot.player,
		slot.attachSlot,
		slot.empty,
		slot.rowHasHermit,
		slot.not(slot.frozen),
		slot.not(slot.activeRow)
	)

	props: SingleUse = {
		...singleUse,
		id: 'mending',
		numericId: 78,
		name: 'Mending',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 1,
		description: "Move your active Hermit's attached effect card to any of your AFK Hermits.",
		attachCondition: slot.every(
			singleUse.attachCondition,
			slot.someSlotFulfills(this.pickCondition),
			slot.someSlotFulfills(
				slot.every(slot.activeRow, slot.attachSlot, slot.not(slot.frozen), slot.not(slot.empty))
			)
		),
		log: (values) =>
			`${values.defaultLog} to move $e${values.pick.name}$ to $p${values.pick.hermitCard}$`,
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick an empty effect slot from one of your AFK Hermits',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				const hermitActiveEffectCard = game.findSlot(slot.player, slot.activeRow, slot.attachSlot)

				if (!hermitActiveEffectCard || !hermitActiveEffectCard.rowId) return

				const logInfo = pickedSlot
				logInfo.cardId = hermitActiveEffectCard.rowId.effectCard

				// Apply the mending card
				applySingleUse(game, logInfo)

				// Move the effect card
				game.swapSlots(hermitActiveEffectCard, pickedSlot)
			},
		})
	}
}

export default MendingSingleUseCard
