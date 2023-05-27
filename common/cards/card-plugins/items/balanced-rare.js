import ItemCard from './_item-card'

class BalancedRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-balanced-rare',
			name: 'Balanced',
			rarity: 'rare',
			hermitType: 'balanced',
		})
	}

	register(game) {}
}

export default BalancedRareItemCard
