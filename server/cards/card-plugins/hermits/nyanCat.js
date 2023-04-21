import CharacterCard from './_character-card'

class NyanCatCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'nyanCat',
			name: 'Nyan Cat',
			rarity: 'common',
			characterType: 'cat',
			health: 280,
			primary: {
				name: 'Annoying Song',
				cost: ['cat'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Rainbow Blast',
				cost: ['cat', 'cat','any'],
				damage: 90,
				power: null,
			},
		})
	}

	register(game) {}
}

export default NyanCatCharacterCard
