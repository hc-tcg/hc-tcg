import ItemCard from './_item-card'

class BaconRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_bacon_rare',
			name: 'Bacon',
			rarity: 'rare',
			hermitType: 'bacon',
		})
	}

	register(game) {}
}

export default BaconRareItemCard
