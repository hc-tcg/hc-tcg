import ItemCard from './_item-card'

class AnyTypeCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_any_type_common',
			name: 'Any Type',
			rarity: 'rare',
			hermitType: 'any',
		})
	}

	register(game) {}
}

export default AnyTypeCommonItemCard
