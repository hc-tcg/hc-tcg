import HermitCard from './_hermit-card'

class GeminiTayCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'geminitay-common',
			name: 'Gem',
			rarity: 'common',
			hermitType: 'builder',
			health: 300,
			primary: {
				name: 'Cottagecore',
				cost: ['builder'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Be Great',
				cost: ['builder', 'builder', 'builder'],
				damage: 100,
				power: null,
			},
		})
	}

	register(game) {}
}

export default GeminiTayCommonHermitCard
