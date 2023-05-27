import ItemCard from './_item-card'

class PvPRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-pvp-rare',
			name: 'PvP',
			rarity: 'rare',
			hermitType: 'pvp',
		})
	}

	register(game) {}
}

export default PvPRareItemCard
