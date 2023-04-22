import ItemCard from './_item-card'

class AustralianRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_australian_rare',
			name: 'Australian',
			rarity: 'rare',
			hermitType: 'australian',
		})
	}

	register(game) {}
}

export default AustralianRareItemCard
