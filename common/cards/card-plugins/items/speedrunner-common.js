import ItemCard from './_item-card'

class SpeedrunnerCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_speedrunner_common',
			name: 'Speedrunner',
			rarity: 'common',
			hermitType: 'speedrunner',
		})
	}

	register(game) {}
}

export default SpeedrunnerCommonItemCard
