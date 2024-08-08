import {
	CardComponent,
	ObserverComponent,
	RowComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class SplashPotionOfHealingII extends CardOld {
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
		log: (values) =>
			`${values.defaultLog} and healed all {your|their} Hermits $g30hp$`,
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () =>
			game.components
				.filter(RowComponent, query.row.player(player?.entity))
				.forEach((row) => row.heal(30)),
		)
	}
}

export default SplashPotionOfHealingII
