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
}

export default TerraformCommonItemCard
