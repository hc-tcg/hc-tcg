import HermitCard from './_hermit-card'

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
