import ItemCard from './_item-card'

class PranksterCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-prankster-common',
			name: 'Prankster',
			rarity: 'common',
			hermitType: 'prankster',
		})
	}

	register(game) {}
}

export default PranksterCommonItemCard
