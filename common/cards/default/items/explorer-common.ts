import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import ItemCard from '../../base/item-card'

class ExplorerCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_explorer_common',
			numericId: 53,
			name: 'Explorer',
			rarity: 'common',
			type: 'explorer',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type]
	}
}

export default ExplorerCommonItemCard
