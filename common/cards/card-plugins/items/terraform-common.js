import ItemCard from './_item-card'

class TerraformCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_terraform_common',
			name: 'Terraform',
			rarity: 'common',
			hermitType: 'terraform',
		})
	}

	getEnergy(game, instance, pos) {
		return [this.hermitType]
	}
}

export default TerraformCommonItemCard
