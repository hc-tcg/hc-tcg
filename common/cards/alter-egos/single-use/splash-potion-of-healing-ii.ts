import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
import Card, {SingleUse, singleUse} from '../../base/card'

class SplashPotionOfHealingIISingleUseCard extends Card {
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
		const {player} = pos

		player.hooks.onApply.add(component, () => {
			game
				.filterSlots(slot.player, slot.hermitSlot)
				.forEach(({rowId: row, cardId: card}) => healHermit(row, 20))
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default SplashPotionOfHealingIISingleUseCard
