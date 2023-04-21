import CharacterCard from './_character-card'

class CatSleeoCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'sleepy-catSleeo',
			name: 'Cat Sleeo',
			rarity: 'common',
			characterType: 'cat',
			health: 270,
			primary: {
				name: 'Eat Ramen',
				cost: ['cat'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Scream Lyrics',
				cost: ['cat', 'any'],
				damage: 80,
				power: null,
			},
		})
	}

	register(game) {}
}

export default CatSleeoCharacterCard
