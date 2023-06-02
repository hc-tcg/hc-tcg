import HermitCard from './_hermit-card'

class ImpulseSVCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'impulsesv_common',
			name: 'Impulse',
			rarity: 'common',
			hermitType: 'farm',
			health: 270,
			primary: {
				name: 'Shovel Shuffle',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'iAttack',
				cost: ['farm', 'any'],
				damage: 70,
				power: null,
			},
		})
	}
}

export default ImpulseSVCommonHermitCard
