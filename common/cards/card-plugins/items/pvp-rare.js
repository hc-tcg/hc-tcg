import ItemCard from './_item-card'

class PvPRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_pvp_rare',
			name: 'PvP',
			rarity: 'rare',
			hermitType: 'pvp',
		})
	}
}

export default PvPRareItemCard
