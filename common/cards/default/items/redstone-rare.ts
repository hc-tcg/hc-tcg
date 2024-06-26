import ItemCard from '../../base/item-card'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'

class RedstoneRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_redstone_rare',
			numericId: 64,
			name: 'Redstone',
			rarity: 'rare',
			type: 'redstone',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type, this.type]
	}
}

export default RedstoneRareItemCard
