import ItemCard from './_item-card'

class PranksterCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_prankster_common',
			name: 'Prankster',
			rarity: 'common',
			hermitType: 'prankster',
		})
	}

	getEnergy(game, instance, pos) {
		return [this.hermitType]
	}
}

export default PranksterCommonItemCard
