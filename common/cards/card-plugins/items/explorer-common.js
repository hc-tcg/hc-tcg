import ItemCard from './_item-card'

class ExplorerCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_explorer_common',
			name: 'Explorer',
			rarity: 'common',
			hermitType: 'explorer',
		})
	}

	register(game) {}
}

export default ExplorerCommonItemCard
