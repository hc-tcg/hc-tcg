import HermitCard from '../base/hermit-card'

class ZedaphPlaysCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zedaphplays_common',
			numericId: 113,
			name: 'Zedaph',
			rarity: 'common',
			hermitType: 'redstone',
			health: 250,
			primary: {
				name: 'For Science',
				cost: ['redstone'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Hadjah!',
				cost: ['redstone', 'any'],
				damage: 70,
				power: null,
			},
		})
	}
}

export default ZedaphPlaysCommonHermitCard
