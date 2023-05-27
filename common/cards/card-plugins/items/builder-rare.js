import ItemCard from './_item-card'

class BuilderRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-builder-rare',
			name: 'Builder',
			rarity: 'rare',
			hermitType: 'builder',
		})
	}

	register(game) {}
}

export default BuilderRareItemCard
