import ItemCard from './_item-card'

class RedstoneRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-redstone-rare',
			name: 'Redstone',
			rarity: 'rare',
			hermitType: 'redstone',
		})
	}

	register(game) {}
}

export default RedstoneRareItemCard
