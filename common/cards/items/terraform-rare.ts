import ItemCard from '../base/item-card'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'

class TerraformRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_terraform_rare',
			name: 'Terraform',
			rarity: 'rare',
			hermitType: 'terraform',
		})
	}

	getEnergy(game: GameModel, instance: string, pos: CardPosModel) {
		return [this.hermitType, this.hermitType]
	}
}

export default TerraformRareItemCard
