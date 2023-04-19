import CharacterCard from './_character-card'

class FrogCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'frog',
			name: 'Frog',
			rarity: 'common',
			characterType: 'minecraft',
			health: 280,
			primary: {
				name: 'Lick',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Pounce',
				cost: ['any', 'any'],
				damage: 60,
				power: null,
			},
		})
	}

	register(game) {}
}

export default FrogCharacterCard
