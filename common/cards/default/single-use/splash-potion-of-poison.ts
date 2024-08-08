import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import PoisonEffect from '../../../status-effects/poison'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const SplashPotionOfPoison: SingleUse = {
	...singleUse,
	id: 'splash_potion_of_poison',
	numericId: 90,
	name: 'Splash Potion of Poison',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	description: "Poison your opponent's active Hermit.",
	showConfirmationModal: true,
	sidebarDescriptions: [
		{
			type: 'statusEffect',
			name: 'poison',
		},
	],
	attachCondition: query.every(
		singleUse.attachCondition,
		query.slot.opponentHasActiveHermit,
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, PoisonEffect, component.entity)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	},
}

export default SplashPotionOfPoison
