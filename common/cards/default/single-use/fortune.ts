import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import FortuneStatusEffect from '../../../status-effects/fortune'

// We could stop displaying the coin flips but I think it may confuse players when Zedaph or Pearl uses fortune.
class Fortune extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'fortune',
		numericId: 26,
		name: 'Fortune',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 1,
		description: 'Any coin flips on this turn are not required, as "heads" is assumed.',
		showConfirmationModal: true,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, FortuneStatusEffect, component.entity)
				.apply(player.entity)
		})
	}
}

export default Fortune
