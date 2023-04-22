import ItemCard from './_item-card'

class CatRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_cat_rare',
			name: 'Cat',
			rarity: 'rare',
			characterType: 'cat',
		})
	}

	register(game) {}
}

export default CatRareItemCard
