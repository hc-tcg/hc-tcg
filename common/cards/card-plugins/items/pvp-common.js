import ItemCard from './_item-card'

class PvPCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-pvp-common',
			name: 'PvP',
			rarity: 'common',
			hermitType: 'pvp',
		})
	}

	register(game) {}
}

export default PvPCommonItemCard
