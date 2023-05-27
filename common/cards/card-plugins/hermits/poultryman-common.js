import HermitCard from './_hermit-card'

class PoultrymanCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'poultryman-common',
			name: 'Poultry Man',
			rarity: 'common',
			hermitType: 'prankster',
			health: 260,
			primary: {
				name: 'Eggscuse Me',
				cost: ['prankster'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Eggsplosion',
				cost: ['prankster', 'prankster'],
				damage: 80,
				power: null,
			},
		})
	}

	register(game) {}
}

export default PoultrymanCommonHermitCard
