import ItemCard from './_item-card'

class FarmRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-farm-rare',
			name: 'Farm',
			rarity: 'rare',
			hermitType: 'farm',
		})
	}

	register(game) {}
}

export default FarmRareItemCard
