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

	getEnergy(game, instance, pos) {
		return [this.hermitType, this.hermitType]
	}
}

export default PvPRareItemCard
