import {GameModel} from '../../../models/game-model'
import {row, slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
import Card, {SingleUse, singleUse} from '../../base/card'

class SplashPotionOfHealingSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'splash_potion_of_healing',
		numericId: 89,
		name: 'Splash Potion of Healing',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		description: 'Heal all of your Hermits 20hp.',
		showConfirmationModal: true,
		log: (values) => `${values.defaultLog} and healed all {your|their} Hermits $g20hp$`,
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.add(component, () =>
			game.state.rows.filterEntities(row.player(player?.id || null)).forEach((row) => row.heal(20))
		)
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default SplashPotionOfHealingSingleUseCard
