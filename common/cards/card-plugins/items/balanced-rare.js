import ItemCard from './_item-card'

class BalancedRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_balanced_rare',
			name: 'Balanced',
			rarity: 'rare',
			hermitType: 'balanced',
		})
	}
}

export default BalancedRareItemCard
