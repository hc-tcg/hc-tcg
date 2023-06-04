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
}

export default FarmRareItemCard
