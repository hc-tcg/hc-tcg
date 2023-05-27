import HermitCard from './_hermit-card'

class Docm77CommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'docm77-common',
			name: 'Docm77',
			rarity: 'common',
			hermitType: 'redstone',
			health: 260,
			primary: {
				name: 'Hive Mind',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'G.O.A.T.',
				cost: ['redstone', 'any'],
				damage: 70,
				power: null,
			},
		})
	}

	register(game) {}
}

export default Docm77CommonHermitCard
