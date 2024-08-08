import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import WeaknessEffect from '../../../status-effects/weakness'
import CardOld from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class PotionOfWeakness extends CardOld {
	props: SingleUse = {
		...singleUse,
		id: 'potion_of_weakness',
		numericId: 146,
		name: 'Potion of Weakness',
		expansion: 'alter_egos',
		rarity: 'common',
		tokens: 2,
		description:
			"Your opponent's active Hermit is weak to your active Hermit's type for 3 turns.",
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'weak',
			},
		],
		showConfirmationModal: true,
		attachCondition: query.every(
			singleUse.attachCondition,
			query.slot.opponentHasActiveHermit,
		),
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer, player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, WeaknessEffect, component.entity)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	}
}

export default PotionOfWeakness
