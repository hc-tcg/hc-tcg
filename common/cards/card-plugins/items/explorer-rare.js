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

	getEnergy(game, instance, pos) {
		return [this.hermitType, this.hermitType]
	}
}

export default ExplorerRareItemCard
