import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import SmeltingEffect from '../../../status-effects/smelting'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class Furnace extends CardOld {
	props: Attach = {
		...attach,
		id: 'furnace',
		numericId: 203,
		name: 'Furnace',
		expansion: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		description:
			'After 4 turns, all single item cards attached to that Hermit are converted to double item cards. This card is then discarded.',
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		game.components
			.new(StatusEffectComponent, SmeltingEffect, component.entity)
			.apply(component.entity)
	}

	override onDetach(game: GameModel, component: CardComponent) {
		game.components
			.find(
				StatusEffectComponent,
				query.effect.is(SmeltingEffect),
				query.effect.targetIsCardAnd(query.card.entity(component.entity)),
			)
			?.remove()
	}
}

export default Furnace
