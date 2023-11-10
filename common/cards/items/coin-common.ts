import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import ItemCard from '../base/item-card'

class CoinCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_coin_common',
			numericId: 153,
			name: 'Coin',
			rarity: 'common',
			hermitType: 'coin',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType]
	}
}

export default CoinCommonItemCard
