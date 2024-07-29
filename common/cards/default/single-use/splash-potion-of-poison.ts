import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import PoisonEffect from '../../../status-effects/poison'

class SplashPotionOfPoison extends Card {
	props: SingleUse = {
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
		attachCondition: query.every(singleUse.attachCondition, query.slot.opponentHasActiveHermit),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, PoisonEffect)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	}
}

export default SplashPotionOfPoison
