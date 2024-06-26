import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import ItemCard from '../../base/item-card'

class BalancedRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_balanced_rare',
			numericId: 50,
			name: 'Balanced',
			rarity: 'rare',
			type: 'balanced',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type, this.type]
	}
}

export default BalancedRareItemCard
