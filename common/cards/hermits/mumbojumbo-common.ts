import HermitCard from '../base/hermit-card'

class MumboJumboCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'mumbojumbo_common',
			numericId: 80,
			name: 'Mumbo',
			rarity: 'common',
			hermitType: 'redstone',
			health: 270,
			primary: {
				name: 'Chuffed to Bits',
				cost: ['redstone'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Spoon',
				cost: ['redstone', 'redstone'],
				damage: 80,
				power: null,
			},
		})
	}
}

export default MumboJumboCommonHermitCard
