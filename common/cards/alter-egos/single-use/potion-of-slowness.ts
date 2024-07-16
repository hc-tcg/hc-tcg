import {CardComponent, StatusEffectComponent} from '../../../components'
import {card, row, slot} from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import SlownessStatusEffect from '../../../status-effects/slowness'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class PotionOfSlownessSingleUseCard extends Card {
	props: SingleUse = {
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
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			const opponentActiveHermit = game.components.find(
				CardComponent,
				card.slot(slot.hermitSlot),
				card.row(row.active)
			)
			if (!opponentActiveHermit) return
			game.components
				.new(StatusEffectComponent, SlownessStatusEffect)
				.apply(opponentActiveHermit.entity)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default PotionOfSlownessSingleUseCard
