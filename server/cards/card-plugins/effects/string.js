import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class StringEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'string',
			name: 'String',
			rarity: 'ultra_rare',
			description:
				"Placed on any of the opposing player's effect or item slot. Prevents other cards from being placed there.",
		})

		this.attachReq = {target: 'opponent', type: ['effect', 'item']}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {}
}

export default StringEffectCard
