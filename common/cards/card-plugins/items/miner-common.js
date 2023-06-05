import ItemCard from './_item-card'

class MinerCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_miner_common',
			name: 'Miner',
			rarity: 'common',
			hermitType: 'miner',
		})
	}
}

export default MinerCommonItemCard
