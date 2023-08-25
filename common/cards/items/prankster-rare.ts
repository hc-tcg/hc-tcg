import ItemCard from '../base/item-card'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'

class PranksterRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_prankster_rare',
			numeric_id: 60,
			name: 'Prankster',
			rarity: 'rare',
			hermitType: 'prankster',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType, this.hermitType]
	}
}

export default PranksterRareItemCard
