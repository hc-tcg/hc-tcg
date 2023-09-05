import HermitCard from '../base/hermit-card'

class GoodTimesWithScarCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'goodtimeswithscar_common',
			numericId: 32,
			name: 'Scar',
			rarity: 'common',
			hermitType: 'terraform',
			health: 260,
			primary: {
				name: 'Jellie Paws',
				cost: ['terraform'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Hot Guy',
				cost: ['terraform', 'terraform', 'terraform'],
				damage: 100,
				power: null,
			},
		})
	}
}

export default GoodTimesWithScarCommonHermitCard
