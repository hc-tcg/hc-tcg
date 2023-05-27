import HermitCard from './_hermit-card'

class EthosLabCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ethoslab-common',
			name: 'Etho',
			rarity: 'common',
			hermitType: 'balanced',
			health: 260,
			primary: {
				name: 'Snack Time',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Breach',
				cost: ['balanced', 'balanced', 'balanced'],
				damage: 100,
				power: null,
			},
		})
	}

	register(game) {}
}

export default EthosLabCommonHermitCard
