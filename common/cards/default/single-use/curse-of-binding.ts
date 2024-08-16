import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import CurseOfBindingEffect from '../../../status-effects/curse-of-binding'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const CurseOfBinding: SingleUse = {
	...singleUse,
	id: 'curse_of_binding',
	numericId: 11,
	name: 'Curse Of Binding',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	showConfirmationModal: true,
	description:
		'Your opponent can not make their active Hermit go AFK on their next turn.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer, player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, CurseOfBindingEffect, component.entity)
				.apply(opponentPlayer.entity)
		})
	},
}

export default CurseOfBinding
