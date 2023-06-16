import ItemCard from './_item-card'

class FarmRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_farm_rare',
			name: 'Farm',
			rarity: 'rare',
			hermitType: 'farm',
		})
	}

	getEnergy(game, instance, pos) {
		return [this.hermitType, this.hermitType]
	}
}

export default FarmRareItemCard
