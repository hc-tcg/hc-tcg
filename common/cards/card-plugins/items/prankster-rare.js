import ItemCard from './_item-card'

class PranksterRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_prankster_rare',
			name: 'Prankster',
			rarity: 'rare',
			hermitType: 'prankster',
		})
	}
}

export default PranksterRareItemCard
