import ItemCard from './_item-card'

class CatCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_cat_common',
			name: 'Cat',
			rarity: 'common',
			hermitType: 'cat',
		})
	}

	register(game) {}
}

export default CatCommonItemCard
