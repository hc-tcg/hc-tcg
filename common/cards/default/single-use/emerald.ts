import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

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
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(
				SlotComponent,
				query.every(slot.currentPlayer, slot.activeRow, slot.attachSlot, query.not(slot.frozen))
			),
			query.exists(
				SlotComponent,
				query.every(
					slot.opponent,
					slot.activeRow,
					slot.attachSlot,
					query.not(slot.empty),
					query.not(slot.frozen)
				)
			)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			const playerSlot = game.components.find(
				SlotComponent,
				slot.currentPlayer,
				slot.activeRow,
				slot.attachSlot
			)
			const opponentSlot = game.components.find(
				SlotComponent,
				slot.opponent,
				slot.activeRow,
				slot.attachSlot
			)

			game.swapSlots(playerSlot, opponentSlot)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default EmeraldSingleUseCard
