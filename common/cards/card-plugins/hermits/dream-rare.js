import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class DreamRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'dream_rare',
			name: 'Dream',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 290,
			primary: {
				name: "C'mere",
				cost: ['speedrunner', 'any'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Transition',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 90,
				power: 'Flip a Coin.\n\nIf heads, HP is set randomly between 10-290.',
			},
		})
	}
}

export default DreamRareHermitCard
