import {GameModel} from '../../../models/game-model'
import {row} from '../../../components/query'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {CardComponent, RowComponent} from '../../../components'
import {SingleUse} from '../../base/types'

class SplashPotionOfHealing extends Card {
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

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player} = component

		player.hooks.onApply.add(component, () =>
			game.components
				.filter(RowComponent, row.player(player?.entity))
				.forEach((row) => row.heal(20))
		)
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default SplashPotionOfHealing
