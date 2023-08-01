import HermitCard from '../base/hermit-card'

class JoeHillsCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'joehills_common',
			name: 'Joe',
			rarity: 'common',
			hermitType: 'explorer',
			health: 270,
			primary: {
				name: 'Howdy',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Haiku',
				cost: ['explorer', 'explorer', 'any'],
				damage: 90,
				power: null,
			},
		})
	}
}

export default JoeHillsCommonHermitCard
