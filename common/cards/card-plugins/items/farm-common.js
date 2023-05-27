import ItemCard from './_item-card'

class FarmCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-farm-common',
			name: 'Farm',
			rarity: 'common',
			hermitType: 'farm',
		})
	}

	register(game) {}
}

export default FarmCommonItemCard
