import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class ExplorerRareItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_explorer_rare',
		numericId: 54,
		name: 'Explorer Item x2',
		shortName: 'Explorer',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'explorer',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default ExplorerRareItemCard
