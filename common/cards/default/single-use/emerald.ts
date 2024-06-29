import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import SingleUseCard from '../../base/single-use-card'

class EmeraldSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'emerald',
			numericId: 18,
			name: 'Emerald',
			rarity: 'rare',
			description: "Steal or swap the attached effect card of your opponent's active Hermit.",
		})
	}

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(
			slot.every(slot.player, slot.activeRow, slot.attachSlot, slot.not(slot.frozen))
		),
		slot.someSlotFulfills(
			slot.every(
				slot.opponent,
				slot.activeRow,
				slot.attachSlot,
				slot.not(slot.empty),
				slot.not(slot.frozen)
			)
		)
	)

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, () => {
			const playerSlot = game.findSlot(slot.every(slot.player, slot.activeRow, slot.attachSlot))
			const opponentSlot = game.findSlot(slot.every(slot.opponent, slot.activeRow, slot.attachSlot))

			game.swapSlots(playerSlot, opponentSlot)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default EmeraldSingleUseCard
