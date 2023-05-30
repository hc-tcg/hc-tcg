import HermitCard from './_hermit-card'

class ZombieCleoCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zombiecleo_common',
			name: 'Cleo',
			rarity: 'common',
			hermitType: 'builder',
			health: 260,
			primary: {
				name: "It's Fine",
				cost: ['builder'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Revenge',
				cost: ['builder', 'builder'],
				damage: 80,
				power: null,
			},
		})
	}

	register(game) {}
}

export default ZombieCleoCommonHermitCard
