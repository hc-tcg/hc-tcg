import ItemCard from './_item-card'

class IceCreamRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_ice_cream_rare',
			name: 'Ice Cream',
			rarity: 'rare',
			characterType: 'ice-cream',
		})
	}

	register(game) {}
}

export default IceCreamRareItemCard
