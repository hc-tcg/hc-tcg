import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

class RendogRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'rendog_rare',
			name: 'Rendog',
			rarity: 'rare',
			hermitType: 'builder',
			health: 290,
			primary: {
				name: "Comin' At Ya",
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Role Play',
				cost: ['builder', 'builder', 'builder'],
				damage: 0,
				power: 'Ren mimics special move of the opposing Hermit.',
			},
		})
	}

	register(game) {
		// TODO -
	}
}

export default RendogRareHermitCard
