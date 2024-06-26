import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import ItemCard from '../../base/item-card'

class ExplorerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_explorer_rare',
			numericId: 54,
			name: 'Explorer',
			rarity: 'rare',
			type: 'explorer',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type, this.type]
	}
}

export default ExplorerRareItemCard
