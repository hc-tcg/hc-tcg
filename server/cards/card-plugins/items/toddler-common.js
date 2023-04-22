import ItemCard from './_item-card'

class ToddlerCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_toddler_common',
			name: 'Toddler',
			rarity: 'common',
			characterType: 'toddler',
		})
	}

	register(game) {}
}

export default ToddlerCommonItemCard
