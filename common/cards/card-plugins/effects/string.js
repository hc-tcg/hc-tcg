import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'

class StringEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'string',
			name: 'String',
			rarity: 'ultra_rare',
			description:
				"Placed on any of the opposing player's effect or item slots. Prevents other cards from being placed there.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {boolean}
	 */
	canAttach(game, pos) {
		const {opponentPlayer} = game.ds

		// attach to effect or item slot
		if (pos.slotType !== 'effect' && pos.slotType !== 'item') return false

		// can only attach to opponent
		if (pos.playerId !== opponentPlayer.id) return false

		// we don't care if there's a hermit there or not
		return true
	}
}

export default StringEffectCard
