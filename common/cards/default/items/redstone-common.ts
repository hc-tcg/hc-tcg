import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class RedstoneItem extends Card {
	props: Item = {
		...item,
		id: 'item_redstone_common',
		numericId: 63,
		name: 'Redstone Item',
		shortName: 'Redstone',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'redstone',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default RedstoneItem
