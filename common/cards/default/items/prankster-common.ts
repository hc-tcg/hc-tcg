import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import ItemCard from '../../base/item-card'

class PranksterCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_prankster_common',
			numericId: 59,
			name: 'Prankster',
			rarity: 'common',
			type: 'prankster',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type]
	}
}

export default PranksterCommonItemCard
