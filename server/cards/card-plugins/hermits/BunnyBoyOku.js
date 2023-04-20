import CharacterCard from './_character-card'

class BunnyBoyOkuCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'bunnyBoyOku',
			name: 'Bunny Boy Oku',
			rarity: 'common',
			characterType: 'australian',
			health: 290,
			primary: {
				name: 'The Avatar',
				cost: ['australian'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Eat A Cooke',
				cost: ['australian', 'australian', 'australian'],
				damage: 100,
				power: null,
			},
		})
	}
// done
	register(game) {}
}

export default BunnyBoyOkuCharacterCard
