import CharacterCard from './_character-card'

class ChildCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'child',
			name: 'Child',
			rarity: 'common',
			characterType: 'toddler',
			health: 270,
			primary: {
				name: 'Spelling',
				cost: ['toddler'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Screaming',
				cost: ['toddler', 'toddler'],
				damage: 80,
				power: null,
			},
		})
	}

	register(game) {}
}

export default ChildCharacterCard
