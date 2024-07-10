import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
import Card, {SingleUse, singleUse} from '../../base/card'

class EmeraldSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'emerald',
		numericId: 18,
		name: 'Emerald',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		description: "Steal or swap the attached effect card of your opponent's active Hermit.",
		showConfirmationModal: true,
		attachCondition: slot.every(
			singleUse.attachCondition,
			slot.someSlotFulfills(
				slot.every(slot.currentPlayer, slot.activeRow, slot.attachSlot, slot.not(slot.frozen))
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
		),
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, () => {
			const playerSlot = game.findSlot(slot.currentPlayer, slot.activeRow, slot.attachSlot)
			const opponentSlot = game.findSlot(slot.opponent, slot.activeRow, slot.attachSlot)

			game.swapSlots(playerSlot, opponentSlot)
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default EmeraldSingleUseCard
