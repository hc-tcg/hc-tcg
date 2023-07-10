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

	getEnergy(game, instance, pos) {
		return [this.hermitType]
	}
}

export default BalancedCommonItemCard
