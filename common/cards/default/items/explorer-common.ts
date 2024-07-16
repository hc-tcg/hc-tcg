import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class ExplorerItem extends Card {
	props: Item = {
		...item,
		id: 'item_explorer_common',
		numericId: 53,
		name: 'Explorer Item',
		shortName: 'Explorer',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'explorer',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default ExplorerItem
