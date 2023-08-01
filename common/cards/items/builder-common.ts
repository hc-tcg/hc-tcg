import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import ItemCard from '../base/item-card'

class BuilderCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_builder_common',
			name: 'Builder',
			rarity: 'common',
			hermitType: 'builder',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType]
	}
}

export default BuilderCommonItemCard
