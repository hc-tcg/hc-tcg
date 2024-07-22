import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Description, Item} from '../../base/types'
import {item} from '../../base/defaults'

class BuilderDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_builder_rare',
		numericId: 52,
		name: 'Builder Item x2',
		shortName: 'Builder',
		description: 'Counts as 2 Builder Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'builder',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default BuilderDoubleItem
