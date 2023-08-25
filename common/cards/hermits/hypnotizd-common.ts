import HermitCard from '../base/hermit-card'

class HypnotizdCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'hypnotizd_common',
			numeric_id: 36,
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
