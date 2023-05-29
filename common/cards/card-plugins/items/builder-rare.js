import ItemCard from './_item-card'

class BuilderRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_builder_rare',
			name: 'Builder',
			rarity: 'rare',
			hermitType: 'builder',
		})
	}

	register(game) {}
}

export default BuilderRareItemCard
