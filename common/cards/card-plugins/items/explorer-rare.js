import ItemCard from './_item-card'

class ExplorerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-explorer-rare',
			name: 'Explorer',
			rarity: 'rare',
			hermitType: 'explorer',
		})
	}

	register(game) {}
}

export default ExplorerRareItemCard
