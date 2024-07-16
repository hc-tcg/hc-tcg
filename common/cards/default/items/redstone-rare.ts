import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class RedstoneDoubleItem extends Card {
	props: Item = {
		...item,
		id: 'item_redstone_rare',
		numericId: 64,
		name: 'Redstone Item x2',
		shortName: 'Redstone',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'redstone',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default RedstoneDoubleItem
