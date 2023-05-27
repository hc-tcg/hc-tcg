import ItemCard from './_item-card'

class BalancedCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_balanced_common',
			name: 'Balanced',
			rarity: 'common',
			hermitType: 'balanced',
		})
	}

	register(game) {}
}

export default BalancedCommonItemCard
