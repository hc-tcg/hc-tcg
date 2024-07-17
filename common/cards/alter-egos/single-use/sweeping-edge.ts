import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class SweepingEdge extends Card {
	discardCondition = query.every(
		query.some(query.slot.activeRow, query.slot.row(query.row.adjacent(query.row.active))),
		query.slot.attachSlot,
		query.slot.opponent,
		query.not(query.slot.empty),
		query.not(query.slot.frozen)
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
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.discardCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			game.components
				.filter(CardComponent, card.slot(this.discardCondition))
				.map((card) => card.discard())
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default SweepingEdge
