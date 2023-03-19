import HermitCard from './_hermit-card'

class ZombieCleoAltEgoHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zombiecleo_altego',
			name: 'Human Cleo',
			rarity: 'altego',
			hermitType: 'pvp',
			health: 290,
			primary: {
				name: "Humanity",
				cost: ['pvp'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Betrayed',
				cost: ['pvp', 'pvp'],
				damage: 70,
				power: null,
			},
		})
	}

	register(game) {}
}

export default ZombieCleoAltEgoHermitCard
