import ItemCard from './_item-card'

class BuilderCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_builder_common',
			name: 'Builder',
			rarity: 'common',
			hermitType: 'builder',
		})
	}

	getEnergy(game, instance, pos) {
		return [this.hermitType]
	}
}

export default BuilderCommonItemCard
