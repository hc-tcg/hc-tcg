import ItemCard from '../base/item-card'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'

class RedstoneRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_redstone_rare',
			name: 'Redstone',
			rarity: 'rare',
			hermitType: 'redstone',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType, this.hermitType]
	}
}

export default RedstoneRareItemCard
