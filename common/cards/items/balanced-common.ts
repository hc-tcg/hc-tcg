import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import ItemCard from '../base/item-card'

class BalancedCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_balanced_common',
			name: 'Balanced',
			rarity: 'common',
			hermitType: 'balanced',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType]
	}
}

export default BalancedCommonItemCard
