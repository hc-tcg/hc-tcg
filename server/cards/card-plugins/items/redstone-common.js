import ItemCard from './_item-card'

class RedstoneCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_redstone_common',
			name: 'Redstone',
			rarity: 'common',
			hermitType: 'redstone',
		})
	}

	register(game) {}
}

export default RedstoneCommonItemCard
