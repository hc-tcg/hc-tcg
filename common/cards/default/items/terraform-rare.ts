import ItemCard from '../../base/item-card'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'

class TerraformRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_terraform_rare',
			numericId: 68,
			name: 'Terraform',
			rarity: 'rare',
			type: 'terraform',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type, this.type]
	}
}

export default TerraformRareItemCard
