import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {discardCard} from '../../../utils/movement'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class SweepingEdgeSingleUseCard extends Card {
	discardCondition = slot.every(
		slot.some(slot.activeRow, slot.adjacentTo(slot.activeRow)),
		slot.attachSlot,
		slot.opponent,
		slot.not(slot.empty),
		slot.not(slot.frozen)
	)

	props: SingleUse = {
		...singleUse,
		id: 'sweeping_edge',
		numericId: 148,
		name: 'Sweeping Edge',
		expansion: 'alter_egos',
		rarity: 'ultra_rare',
		tokens: 2,
		description:
			'Your opponent must discard any effect cards attached to their active Hermit and any adjacent Hermits.',
		showConfirmationModal: true,
		attachCondition: slot.every(
			singleUse.attachCondition,
			slot.someSlotFulfills(this.discardCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(component, () => {
			game
				.filterSlots(this.discardCondition)
				.map((slot) => slot.cardId && discardCard(game, slot.cardId))
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default SweepingEdgeSingleUseCard
