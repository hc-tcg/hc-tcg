import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import ItemCard from '../../base/item-card'

class FarmRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_farm_rare',
			numericId: 56,
			name: 'Farm',
			rarity: 'rare',
			type: 'farm',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type, this.type]
	}
}

export default FarmRareItemCard
