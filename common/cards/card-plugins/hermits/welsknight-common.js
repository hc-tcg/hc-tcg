import HermitCard from './_hermit-card'

class WelsknightCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'welsknight_common',
			name: 'Wels',
			rarity: 'common',
			hermitType: 'builder',
			health: 300,
			primary: {
				name: 'Chivalry',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Judgement',
				cost: ['builder', 'builder', 'any'],
				damage: 90,
				power: null,
			},
		})
	}

	register(game) {}
}

export default WelsknightCommonHermitCard
