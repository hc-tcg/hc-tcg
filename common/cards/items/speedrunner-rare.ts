import ItemCard from '../base/item-card'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'

class SpeedrunnerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_speedrunner_rare',
			numericId: 66,
			name: 'Speedrunner',
			rarity: 'rare',
			hermitType: 'speedrunner',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType, this.hermitType]
	}
}

export default SpeedrunnerRareItemCard
