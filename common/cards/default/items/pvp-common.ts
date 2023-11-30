import ItemCard from '../../base/item-card'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'

class PvPCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_pvp_common',
			numericId: 61,
			name: 'PvP',
			rarity: 'common',
			hermitType: 'pvp',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType]
	}
}

export default PvPCommonItemCard
