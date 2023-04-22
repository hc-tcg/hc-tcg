import ItemCard from './_item-card'

class AnyTypeRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_any_type_rare',
			name: 'Any Type',
			rarity: 'ultra-rare',
			characterType: 'any',
		})
	}

	register(game) {}
}

export default AnyTypeRareItemCard
