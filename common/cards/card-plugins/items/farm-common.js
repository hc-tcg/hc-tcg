import ItemCard from './_item-card'

class FarmCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_farm_common',
			name: 'Farm',
			rarity: 'common',
			hermitType: 'farm',
		})
	}

	getEnergy(game, instance, pos) {
		return [this.hermitType]
	}
}

export default FarmCommonItemCard
