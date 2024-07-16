import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class SplashPotionOfHealingII extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'splash_potion_of_healing_ii',
		numericId: 147,
		name: 'Splash Potion of Healing II',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		description: 'Heal all of your Hermits 30hp.',
		showConfirmationModal: true,
		log: (values) => `${values.defaultLog} and healed all {your|their} Hermits $g30hp$`,
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			game
				.filterSlots(slot.player, slot.hermitSlot)
				.forEach(({rowId: row, cardId: card}) => healHermit(row, 20))
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default SplashPotionOfHealingII
