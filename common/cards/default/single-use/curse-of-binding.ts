import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import CurseOfBindingEffect from '../../../status-effects/curse-of-binding'

class CurseOfBinding extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'curse_of_binding',
		numericId: 11,
		name: 'Curse Of Binding',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		showConfirmationModal: true,
		description: 'Your opponent can not make their active Hermit go AFK on their next turn.',
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {opponentPlayer, player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components.new(StatusEffectComponent, CurseOfBindingEffect).apply(opponentPlayer.entity)
		})
	}
}

export default CurseOfBinding
