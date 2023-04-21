import CharacterCard from './_character-card'

class IceCreamDealerCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'iceCreamDealer',
			name: 'Ice Cream Dealer',
			rarity: 'common',
			characterType: 'iceCream',
			health: 300,
			primary: {
				name: 'Shady Salesman',
				cost: ['iceCream','any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Alleyway Deals',
				cost: ['iceCream', 'iceCream', 'any'],
				damage: 90,
				power: null,
			},
		})
	}

	register(game) {}
}
// cool stuff
export default IceCreamDealerCharacterCard
