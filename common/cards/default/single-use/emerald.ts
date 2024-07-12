import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
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
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(component, () => {
			const playerSlot = game.findSlot(slot.player, slot.activeRow, slot.attachSlot)
			const opponentSlot = game.findSlot(slot.opponent, slot.activeRow, slot.attachSlot)

			game.swapSlots(playerSlot, opponentSlot)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default EmeraldSingleUseCard
