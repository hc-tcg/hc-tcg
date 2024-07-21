import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Description, Item} from '../../base/types'
import {item} from '../../base/defaults'

class FarmDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_farm_rare',
		numericId: 56,
		name: 'Farm Item x2',
		shortName: 'Farm',
		description: 'Counts as 2 Farm Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'farm',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default FarmDoubleItem
