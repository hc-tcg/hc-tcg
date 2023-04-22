import ItemCard from './_item-card'

class AustralianCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_australian_common',
			name: 'Australian',
			rarity: 'common',
			characterType: 'australian',
		})
	}

	register(game) {}
}

export default AustralianCommonItemCard
