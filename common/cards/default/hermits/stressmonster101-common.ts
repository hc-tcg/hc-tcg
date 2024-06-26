import HermitCard from '../../base/hermit-card'

class StressMonster101CommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'stressmonster101_common',
			numericId: 92,
			name: 'Stress',
			rarity: 'common',
			type: 'builder',
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
}

export default StressMonster101CommonHermitCard
