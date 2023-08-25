import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import ItemCard from '../base/item-card'

class ExplorerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_explorer_rare',
			numeric_id: 54,
			name: 'Explorer',
			rarity: 'rare',
			hermitType: 'explorer',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType, this.hermitType]
	}
}

export default ExplorerRareItemCard
