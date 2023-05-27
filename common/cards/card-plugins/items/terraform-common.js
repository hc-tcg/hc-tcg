import ItemCard from './_item-card'

class TerraformCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-terraform-common',
			name: 'Terraform',
			rarity: 'common',
			hermitType: 'terraform',
		})
	}

	register(game) {}
}

export default TerraformCommonItemCard
