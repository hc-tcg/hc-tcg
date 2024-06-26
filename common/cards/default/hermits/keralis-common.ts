import HermitCard from '../../base/hermit-card'

class KeralisCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'keralis_common',
			numericId: 71,
			name: 'Keralis',
			rarity: 'common',
			type: 'builder',
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
