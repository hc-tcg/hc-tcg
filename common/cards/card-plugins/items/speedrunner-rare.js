import ItemCard from './_item-card'

class SpeedrunnerRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_speedrunner_rare',
			name: 'Speedrunner',
			rarity: 'rare',
			hermitType: 'speedrunner',
		})
	}

	getEnergy(game, instance, pos) {
		return [this.hermitType, this.hermitType]
	}
}

export default SpeedrunnerRareItemCard
