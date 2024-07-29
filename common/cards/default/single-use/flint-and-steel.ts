import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class FlintAndSteel extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'flint_&_steel',
		numericId: 25,
		name: 'Flint & Steel',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		description:
			'Discard your hand. Draw 3 cards.\nCan be used even if you do not have any cards in your hand.',
		showConfirmationModal: true,
		log: (values) => `${values.defaultLog} to discard {your|their} hand and draw 3 cards`,
	}

	override onAttach(_game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			player.getHand().forEach((card) => card.discard())
			player.draw(3)
		})
	}
}

export default FlintAndSteel
