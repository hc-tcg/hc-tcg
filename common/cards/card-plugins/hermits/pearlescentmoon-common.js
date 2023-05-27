import HermitCard from './_hermit-card'

class PearlescentMoonCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'pearlescentmoon-common',
			name: 'Pearl',
			rarity: 'common',
			hermitType: 'builder',
			health: 270,
			primary: {
				name: '5 AM',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: "What's This?",
				cost: ['builder', 'builder', 'any'],
				damage: 90,
				power: null,
			},
		})
	}

	register(game) {}
}

export default PearlescentMoonCommonHermitCard
