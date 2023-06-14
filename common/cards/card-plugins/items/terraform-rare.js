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

	getEnergy(game, instance, pos) {
		return [this.hermitType, this.hermitType]
	}
}

export default TerraformRareItemCard
