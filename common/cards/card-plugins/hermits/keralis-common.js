import HermitCard from './_hermit-card'

class KeralisCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'keralis_common',
			name: 'Keralis',
			rarity: 'common',
			hermitType: 'builder',
			health: 270,
			primary: {
				name: 'Looky Looky',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'NoNoNoNo',
				cost: ['builder', 'builder', 'any'],
				damage: 90,
				power: null,
			},
		})
	}
}

export default KeralisCommonHermitCard
