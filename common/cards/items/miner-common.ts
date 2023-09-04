import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import ItemCard from '../base/item-card'

class MinerCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_miner_common',
			numericId: 57,
			name: 'Miner',
			rarity: 'common',
			hermitType: 'miner',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType]
	}
}

export default MinerCommonItemCard
