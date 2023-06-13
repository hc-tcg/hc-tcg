import ItemCard from './_item-card'

class RedstoneRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_redstone_rare',
			name: 'Redstone',
			rarity: 'rare',
			hermitType: 'redstone',
		})
	}

	getEnergy(game, instance, pos) {
		return [this.hermitType, this.hermitType]
	}
}

export default RedstoneRareItemCard
