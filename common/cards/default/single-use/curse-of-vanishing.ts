import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class CurseOfVanishing extends Card {
	discardCondition = query.every(
		slot.opponent,
		slot.activeRow,
		slot.attachSlot,
		query.not(slot.empty),
		query.not(slot.frozen)
	)

	props: SingleUse = {
		...singleUse,
		id: 'curse_of_vanishing',
		numericId: 12,
		name: 'Curse Of Vanishing',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		description: 'Your opponent must discard any effect card attached to their active Hermit.',
		showConfirmationModal: true,
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.discardCondition)
		),
	}

	public override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.filter(SlotComponent, this.discardCondition)
				.map((slot) => slot.getCard()?.discard())
		})
	}
}

export default CurseOfVanishing
