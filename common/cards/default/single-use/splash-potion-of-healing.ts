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

const SplashPotionOfHealing: SingleUse = {
	...singleUse,
	id: 'splash_potion_of_healing',
	numericId: 89,
	name: 'Splash Potion of Healing',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	description: 'Heal all of your Hermits 20hp.',
	showConfirmationModal: true,
	log: (values) =>
		`${values.defaultLog} and healed all {your|their} Hermits $g20hp$`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () =>
			game.components
				.filter(RowComponent, query.row.player(player?.entity))
				.forEach((row) => row.heal(20)),
		)
	},
}

export default SplashPotionOfHealing
