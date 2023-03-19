import HermitCard from './_hermit-card'

// Source: https://www.youtube.com/watch?v=dq4dWiBjR74&t=146s 0:43
// Secondary effect: Opposing hermit performs a Coin flip on the following turn. 
// If heads, will (also) damage own AFK hermit by +40HP (number subject to change). 


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
				power: 'Opposing hermit performs a coin flip on the following turn.\n\nIf heads, deal +40HP to AFK Hermit.',
			},
		})
	}

	register(game) {}
}

export default ZombieCleoAltEgoHermitCard
