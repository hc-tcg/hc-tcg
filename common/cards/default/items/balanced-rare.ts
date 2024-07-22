import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Description, Item} from '../../base/types'
import {item} from '../../base/defaults'

class BalancedDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_balanced_rare',
		numericId: 50,
		name: 'Balanced Item x2',
		shortName: 'Balanced',
		description: 'Counts as 2 Balanced Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'balanced',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default BalancedDoubleItem
