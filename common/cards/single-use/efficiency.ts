import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import EfficiencyEffect from '../../status-effects/efficiency'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const Efficiency: SingleUse = {
	...singleUse,
	id: 'efficiency',
	numericId: 17,
	name: 'Efficiency',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	description:
		'You may use attacks this turn without having the necessary item cards attached.',
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
				.new(StatusEffectComponent, EfficiencyEffect, component.entity)
				.apply(player.entity)
		})
	},
}

export default Efficiency
