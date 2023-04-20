import CharacterCard from './_character-card'

class ConfusedMemeCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'confusedMeme',
			name: 'Confused Meme',
			rarity: 'common',
			characterType: 'toddler',
			health: 250,
			primary: {
				name: 'Baby Talk',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Cry',
				cost: ['toddler', 'any'],
				damage: 70,
				power: null,
			},
		})
	}

	register(game) {}
}

export default ConfusedMemeCharacterCard
