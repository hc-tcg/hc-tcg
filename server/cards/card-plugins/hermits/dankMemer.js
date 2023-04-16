import CharacterCard from './_character-card'

class DankMemerCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'dankMemer',
			name: 'Dank Memer',
			rarity: 'common',
			characterType: 'bot',
			health: 290,
			primary: {
				name: '/beg',
				cost: ['bot'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: '/rob',
				cost: ['bot', 'bot', 'any'],
				damage: 90,
				power: null,
			},
		})
	}

	register(game) {}
}

export default DankMemerCharacterCard
