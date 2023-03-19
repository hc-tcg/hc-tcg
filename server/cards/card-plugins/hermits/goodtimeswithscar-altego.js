import HermitCard from './_hermit-card'

// Source: https://www.youtube.com/watch?v=dq4dWiBjR74&t=146s 2:20
// Bow card works in conjunction with HotGuy

class GoodTimesWithScarAltEgoHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'goodtimeswithscar_altego',
			name: 'Hotguy',
			rarity: 'altego',
			hermitType: 'explorer',
			health: 280,
			primary: {
				name: 'Velocité',
				cost: ['explorer'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Hawkeye',
				cost: ['explorer', 'explorer'],
				damage: 80,
				power: null,
			},
		})
	}

	register(game) {}
}

export default GoodTimesWithScarAltEgoHermitCard
