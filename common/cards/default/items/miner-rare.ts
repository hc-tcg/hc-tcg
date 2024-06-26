import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import ItemCard from '../../base/item-card'

class MinerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_miner_rare',
			numericId: 58,
			name: 'Miner',
			rarity: 'rare',
			type: 'miner',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type, this.type]
	}
}

export default MinerRareItemCard
