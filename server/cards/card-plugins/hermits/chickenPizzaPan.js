import CharacterCard from './_character-card'

class ChickenPizzaPanCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'chickenPizzaPan',
			name: 'Chicken Pizza Pan',
			rarity: 'common',
			hermitType: 'bacon',
			health: 300,
			primary: {
				name: 'Concrete Throw',
				cost: ['bacon'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Potatosium',
				cost: ['bacon', 'bacon', 'bacon'],
				damage: 100,
				power: null,
			},
		})
	}

	register(game) {}
}

export default ChickenPizzaPanCharacterCard
