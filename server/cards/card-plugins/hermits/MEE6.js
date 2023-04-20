import CharacterCard from './_character-card'

class MEE6CharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'MEE6',
			name: 'MEESEXY',
			rarity: 'common',
			characterType: 'bot',
			health: 280,
			primary: {
				name: 'Play Jams',
				cost: ['bot'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Level Up',
				cost: ['bot', 'bot','bot'],
				damage: 100,
				power: null,
			},
		})
	}
// done
	register(game) {}
}

export default MEE6CharacterCard
