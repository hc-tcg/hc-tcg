import ItemCard from './_item-card'

class MinerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_miner_rare',
			name: 'Miner',
			rarity: 'rare',
			hermitType: 'miner',
		})
	}

	register(game) {}
}

export default MinerRareItemCard
