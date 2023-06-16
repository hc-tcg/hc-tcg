import ItemCard from './_item-card'

class PvPCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_pvp_common',
			name: 'PvP',
			rarity: 'common',
			hermitType: 'pvp',
		})
	}

	getEnergy(game, instance, pos) {
		return [this.hermitType]
	}
}

export default PvPCommonItemCard
