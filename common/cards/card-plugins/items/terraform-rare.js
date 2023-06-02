import ItemCard from './_item-card'

class TerraformRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_terraform_rare',
			name: 'Terraform',
			rarity: 'rare',
			hermitType: 'terraform',
		})
	}
}

export default TerraformRareItemCard
