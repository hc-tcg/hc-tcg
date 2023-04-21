import CharacterCard from './_character-card'

class BurgerCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'chubby-Burger',
			name: 'Burger',
			rarity: 'common',
			characterType: 'bacon',
			health: 270,
			primary: {
				name: 'Patty',
				cost: ['bacon'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Tomato',
				cost: ['bacon', 'bacon'],
				damage: 70,
				power: null,
			},
		})
	}

	register(game) {}
}
// done
export default BurgerCharacterCard
