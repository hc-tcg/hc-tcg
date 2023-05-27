import ItemCard from './_item-card'

class TerraformRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-terraform-rare',
			name: 'Terraform',
			rarity: 'rare',
			hermitType: 'terraform',
		})
	}

	register(game) {}
}

export default TerraformRareItemCard
