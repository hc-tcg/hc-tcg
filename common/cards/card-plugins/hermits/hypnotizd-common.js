import HermitCard from './_hermit-card'

class HypnotizdCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'hypnotizd_common',
			name: 'Hypno',
			rarity: 'common',
			hermitType: 'balanced',
			health: 250,
			primary: {
				name: 'What Up',
				cost: ['balanced'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Max Attack',
				cost: ['balanced', 'balanced', 'balanced'],
				damage: 100,
				power: null,
			},
		})
	}
}

export default HypnotizdCommonHermitCard
