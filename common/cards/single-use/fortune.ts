import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import FortuneStatusEffect from '../../status-effects/fortune'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

// We could stop displaying the coin flips but I think it may confuse players when Zedaph or Pearl uses fortune.
const Fortune: SingleUse = {
	...singleUse,
	id: 'fortune',
	numericId: 71,
	name: 'Fortune',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 1,
	description:
		'Any coin flips on this turn are not required, as "heads" is assumed.',
	showConfirmationModal: true,
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, FortuneStatusEffect, component.entity)
				.apply(player.entity)
		})
	},
}

export default Fortune
