import ItemCard from '../base/item-card'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'

class SpeedrunnerCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_speedrunner_common',
			numericId: 65,
			name: 'Speedrunner',
			rarity: 'common',
			hermitType: 'speedrunner',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType]
	}
}

export default SpeedrunnerCommonItemCard
