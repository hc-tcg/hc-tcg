import HermitCard from './_hermit-card'

// Source: https://www.youtube.com/watch?v=YRIGhAnudcg 3:07

class WelsknightAltEgoHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'welsknight_altego',
			name: 'Helsknight',
			rarity: 'altego',
			hermitType: 'pvp',
			health: 270,
			primary: {
				name: 'Pitful',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Trap Hole',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 100,
				power: null,
				// Has a special effect but Beef hasn't mentioned it yet
			},
		})
	}

	register(game) {}
}

export default WelsknightAltEgoHermitCard
