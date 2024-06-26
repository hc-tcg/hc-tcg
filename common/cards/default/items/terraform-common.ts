import ItemCard from '../../base/item-card'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'

class TerraformCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_terraform_common',
			numericId: 67,
			name: 'Terraform',
			rarity: 'common',
			type: 'terraform',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.type]
	}
}

export default TerraformCommonItemCard
