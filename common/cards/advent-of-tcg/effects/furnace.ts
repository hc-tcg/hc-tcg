import {CardComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class Furnace extends Card {
	props: Attach = {
		...attach,
		id: 'furnace',
		numericId: 203,
		name: 'Furnace',
		expansion: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		description:
			'After 4 turns, all single item cards attached to that Hermit are converted to double item cards. This card is then discarded.',
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		applyStatusEffect(game, 'smelting', component)
	}

	override onDetach(game: GameModel, component: CardComponent) {
		game.state.statusEffects.forEach((ail) => {
			if (ail.targetInstance === component) {
				removeStatusEffect(game, pos, ail)
			}
		})
	}
}

export default Furnace
