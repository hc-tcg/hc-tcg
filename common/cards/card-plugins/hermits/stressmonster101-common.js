import HermitCard from './_hermit-card'

class StressMonster101CommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'stressmonster101-common',
			name: 'Stress',
			rarity: 'common',
			hermitType: 'builder',
			health: 280,
			primary: {
				name: "'Ello",
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Geezer',
				cost: ['builder', 'builder'],
				damage: 80,
				power: null,
			},
		})
	}

	register(game) {}
}

export default StressMonster101CommonHermitCard
