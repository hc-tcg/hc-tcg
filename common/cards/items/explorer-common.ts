import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import ItemCard from '../base/item-card'

class ExplorerCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_explorer_common',
			name: 'Explorer',
			rarity: 'common',
			hermitType: 'explorer',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType]
	}
}

export default ExplorerCommonItemCard
