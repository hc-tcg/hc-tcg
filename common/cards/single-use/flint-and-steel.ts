import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const FlintAndSteel: SingleUse = {
	...singleUse,
	id: 'flint_and_steel',
	numericId: 25,
	name: 'Flint & Steel',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	description:
		'Discard your hand. Draw 3 cards.\nCan be used even if you do not have any cards in your hand.',
	showConfirmationModal: true,
	log: (values) =>
		`${values.defaultLog} to discard {your|their} hand and draw 3 cards`,
	onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			player.getHand().forEach((card) => card.discard())
			player.draw(3)
		})
	},
}

export default FlintAndSteel
