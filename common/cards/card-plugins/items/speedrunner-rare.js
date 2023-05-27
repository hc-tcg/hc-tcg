import ItemCard from './_item-card'

class SpeedrunnerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item-speedrunner-rare',
			name: 'Speedrunner',
			rarity: 'rare',
			hermitType: 'speedrunner',
		})
	}

	register(game) {}
}

export default SpeedrunnerRareItemCard
