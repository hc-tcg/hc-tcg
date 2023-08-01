import HermitCard from '../base/hermit-card'

class Cubfan135CommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'cubfan135_common',
			name: 'Cub',
			rarity: 'common',
			hermitType: 'balanced',
			health: 290,
			primary: {
				name: 'Heyo',
				cost: ['balanced'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Vex Magic',
				cost: ['balanced', 'any'],
				damage: 70,
				power: null,
			},
		})
	}
}

export default Cubfan135CommonHermitCard
