import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import WeaknessEffect from '../../../status-effects/weakness'

class PotionOfWeakness extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'potion_of_weakness',
		numericId: 146,
		name: 'Potion of Weakness',
		expansion: 'alter_egos',
		rarity: 'common',
		tokens: 2,
		description: "Your opponent's active Hermit is weak to your active Hermit's type for 3 turns.",
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'weak',
			},
		],
		showConfirmationModal: true,
		attachCondition: query.every(singleUse.attachCondition, query.slot.opponentHasActiveHermit),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {opponentPlayer, player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, WeaknessEffect)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	}
}

export default PotionOfWeakness
