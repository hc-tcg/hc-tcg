import HermitCard from './_hermit-card'

class ZedaphPlaysCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zedaphplays-common',
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

	register(game) {}
}

export default ZedaphPlaysCommonHermitCard
