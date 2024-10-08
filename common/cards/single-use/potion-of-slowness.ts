import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import SlownessEffect from '../../status-effects/slowness'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const PotionOfSlowness: SingleUse = {
	...singleUse,
	id: 'potion_of_slowness',
	numericId: 145,
	name: 'Potion of Slowness',
	expansion: 'alter_egos',
	rarity: 'common',
	tokens: 2,
	description:
		"Your opponent's active Hermit can only use their primary attack on their next turn.",
	showConfirmationModal: true,
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, SlownessEffect, component.entity)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	},
}

export default PotionOfSlowness
