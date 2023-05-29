import EffectCard from './_effect-card'
import {discardCard} from '../../../../server/utils'

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
				"Placed on any of the opposing player's effect or item slots. Prevents other cards from being placed there.",
		})

		this.attachReq = {target: 'opponent', type: ['effect', 'item']}
	}
	/**
	 * @param {GameModel} game
	 * @param {string} targetPlayerId
	 * @param {number} rowIndex
	 * @param {CardTypeT} slotType
	 * @returns {boolean}
	 */
	canAttach(game, targetPlayerId, rowIndex, slotType) {
		const {opponentPlayer} = game.ds

		// attach to effect or item slot
		if (slotType !== 'effect' && slotType !== 'item') return false

		// can only attach to opponent
		if (targetPlayerId !== opponentPlayer.id) return false

		// we don't care if there's a hermit there or not
		return true
	}
}

export default StringEffectCard
