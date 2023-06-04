import ItemCard from './_item-card'

class ExplorerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_explorer_rare',
			name: 'Explorer',
			rarity: 'rare',
			hermitType: 'explorer',
		})
	}
}

export default ExplorerRareItemCard
