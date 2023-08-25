import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import ItemCard from '../base/item-card'

class FarmCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_farm_common',
			numeric_id: 55,
			name: 'Farm',
			rarity: 'common',
			hermitType: 'farm',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType]
	}
}

export default FarmCommonItemCard
