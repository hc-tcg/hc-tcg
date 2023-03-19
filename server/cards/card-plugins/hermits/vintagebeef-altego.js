import HermitCard from './_hermit-card'

class VintageBeefAltEgoHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'vintagebeef_altego',
			name: 'Llamadad',
			rarity: 'altego',
			hermitType: 'balanced',
			health: 290,
			primary: {
				name: 'Spitz',
				cost: ['Balanced'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Matilda',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power: null,
			},
		})
	}

	register(game) {}
}

export default VintageBeefAltEgoHermitCard
