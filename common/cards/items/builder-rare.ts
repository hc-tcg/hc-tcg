import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import ItemCard from '../base/item-card'

class BuilderRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_builder_rare',
			numeric_id: 52,
			name: 'Builder',
			rarity: 'rare',
			hermitType: 'builder',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType, this.hermitType]
	}
}

export default BuilderRareItemCard
