import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const FishingRod: SingleUse = {
	...singleUse,
	id: 'fishing_rod',
	numericId: 24,
	name: 'Fishing Rod',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 2,
	description: 'Draw 2 cards.',
	showConfirmationModal: true,
	log: (values) => `${values.defaultLog} to draw 2 cards`,
	onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			player.draw(2)
			observer.unsubscribe(player.hooks.onApply)
		})
	},
}

export default FishingRod
