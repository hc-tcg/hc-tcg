import CharacterCard from './_character-card'

class QuackittyCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'andrew-Quackitty',
			name: 'Quackitty',
			rarity: 'common',
			characterType: 'cat',
			health: 260,
			primary: {
				name: 'Meow',
				cost: ['cat'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Hairball',
				cost: ['cat', 'cat', 'cat'],
				damage: 100,
				power: null,
			},
		})
	}

	register(game) {}
}

export default QuackittyCharacterCard
