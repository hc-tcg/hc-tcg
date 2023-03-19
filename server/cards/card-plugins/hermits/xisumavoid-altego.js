import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

// Source: https://www.youtube.com/watch?v=YRIGhAnudcg 1:46

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class XisumavoidAltEgoHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xisumavoid_altego',
			name: 'Xisuma',
			rarity: 'altego',
			hermitType: 'balanced',
			health: 280,
			primary: {
				name: 'Evil Inside',
				cost: [],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Derpcoin',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power: "Flip a coin.\n\n If heads, disable one of the opposing hermit's moves",
			},
		})
	}

	register(game) {}
}

export default XisumavoidAltEgoHermitCard
