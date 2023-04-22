import ItemCard from './_item-card'

class ToddlerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_toddler_rare',
			name: 'Toddler',
			rarity: 'rare',
			hermitType: 'toddler',
		})
	}

	register(game) {}
}

export default ToddlerRareItemCard
