import ItemCard from '../base/item-card'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'

class PvPRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_pvp_rare',
			numericId: 62,
			name: 'PvP',
			rarity: 'rare',
			hermitType: 'pvp',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType, this.hermitType]
	}
}

export default PvPRareItemCard
