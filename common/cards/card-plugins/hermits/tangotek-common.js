import HermitCard from './_hermit-card'

class TangoTekCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tangotek_common',
			name: 'Tango',
			rarity: 'common',
			hermitType: 'redstone',
			health: 300,
			primary: {
				name: 'Thing-ificator',
				cost: ['redstone'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Hat Trick',
				cost: ['redstone', 'any'],
				damage: 70,
				power: null,
			},
		})
	}
}

export default TangoTekCommonHermitCard
