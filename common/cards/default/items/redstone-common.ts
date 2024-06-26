import ItemCard from '../../base/item-card'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'

class RedstoneCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_redstone_common',
			numericId: 63,
			name: 'Redstone',
			rarity: 'common',
			type: 'redstone',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type]
	}
}

export default RedstoneCommonItemCard
