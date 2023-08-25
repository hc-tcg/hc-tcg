import HermitCard from '../base/hermit-card'

class FalseSymmetryCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'falsesymmetry_common',
			numeric_id: 22,
			name: 'False',
			rarity: 'common',
			hermitType: 'pvp',
			health: 250,
			primary: {
				name: 'Queen of Hearts',
				cost: ['pvp'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Eagle Eye',
				cost: ['pvp', 'any'],
				damage: 70,
				power: null,
			},
		})
	}
}

export default FalseSymmetryCommonHermitCard
