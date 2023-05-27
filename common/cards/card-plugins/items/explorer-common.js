import ItemCard from './_item-card'

class ExplorerCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-explorer-common',
			name: 'Explorer',
			rarity: 'common',
			hermitType: 'explorer',
		})
	}

	register(game) {}
}

export default ExplorerCommonItemCard
