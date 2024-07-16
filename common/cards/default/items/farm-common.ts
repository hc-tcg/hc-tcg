import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class FarmItem extends Card {
	props: Item = {
		...item,
		id: 'item_farm_common',
		numericId: 55,
		name: 'Farm Item',
		shortName: 'Farm',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'farm',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default FarmItem
