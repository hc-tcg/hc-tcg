import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import LitFuseEffect from '../../../status-effects/lit_fuse'
import {attach} from '../../defaults'
import TNT from '../../single-use/tnt'
import {Attach} from '../../types'

const RealisticBed: Attach = {
	...attach,
	id: 'realistic_bed',
	numericId: 260,
	name: 'Realistic Bed',
	expansion: 'beds',
	rarity: 'ultra_rare',
	tokens: 3,
	description:
		'When attached to a hermit, add 3 TNT cards to the top of your deck. After 4 turns, any TNT or TNT minecarts in your hand explode, dealing 60hp damage to the hermit.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component
		let slot = game.components.new(DeckSlotComponent, player.entity, {
			position: 'front',
		})
		for (let i = 0; i < 3; i++) {
			game.components.new(CardComponent, TNT, slot.entity)
		}
		game.components
			.new(StatusEffectComponent, LitFuseEffect, component.entity)
			.apply(component.entity)
	},
	onDetach(game: GameModel, component: CardComponent) {
		game.components
			.find(
				StatusEffectComponent,
				query.effect.is(LitFuseEffect),
				query.effect.targetIsCardAnd(query.card.entity(component.entity)),
			)
			?.remove()
	},
}

export default RealisticBed
