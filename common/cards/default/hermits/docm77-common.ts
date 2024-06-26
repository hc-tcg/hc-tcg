import HermitCard from '../../base/hermit-card'

class Docm77CommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'docm77_common',
			numericId: 15,
			name: 'Docm77',
			rarity: 'common',
			type: 'redstone',
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
}

export default Docm77CommonHermitCard
