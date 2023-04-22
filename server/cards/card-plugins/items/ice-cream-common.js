import ItemCard from './_item-card'

class IceCreamCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_ice_cream_common',
			name: 'Ice Cream',
			rarity: 'common',
			characterType: 'farm',
		})
	}

	register(game) {}
}

export default IceCreamCommonItemCard
