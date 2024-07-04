import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardInstance} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

class ExplorerCommonItemCard extends Card {
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

	override getEnergy(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		return [this.props.type]
	}
}

export default ExplorerCommonItemCard
