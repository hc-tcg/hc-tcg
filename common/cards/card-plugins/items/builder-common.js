import ItemCard from './_item-card'

class BuilderCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-builder-common',
			name: 'Builder',
			rarity: 'common',
			hermitType: 'builder',
		})
	}

	register(game) {}
}

export default BuilderCommonItemCard
