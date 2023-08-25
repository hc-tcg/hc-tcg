import HermitCard from '../base/hermit-card'

class RendogCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'rendog_common',
			numeric_id: 86,
			name: 'Rendog',
			rarity: 'common',
			hermitType: 'balanced',
			health: 260,
			primary: {
				name: 'Professional',
				cost: ['balanced'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Outrageous',
				cost: ['balanced', 'balanced', 'balanced'],
				damage: 100,
				power: null,
			},
		})
	}
}

export default RendogCommonHermitCard
