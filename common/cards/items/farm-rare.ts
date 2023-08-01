import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import ItemCard from '../base/item-card'

class FarmRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_farm_rare',
			name: 'Farm',
			rarity: 'rare',
			hermitType: 'farm',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType, this.hermitType]
	}
}

export default FarmRareItemCard
