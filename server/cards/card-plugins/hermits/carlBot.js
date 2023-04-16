import CharacterCard from './_character-card'

class CarlBotCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'carlBot',
			name: 'Carl Bot',
			rarity: 'common',
			characterType: 'Bot',
			health: 250,
			primary: {
				name: 'Play a Game',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Run A Poll',
				cost: ['any', 'any'],
				damage: 70,
				power: null,
			},
		})
	}

	register(game) {}
}

export default CarlBotCharacterCard
