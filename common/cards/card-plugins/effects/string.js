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
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {opponentPlayer} = game.ds

		// attach to effect or item slot
		if (pos.slot.type !== 'effect' && pos.slot.type !== 'item') return 'NO'

		// can only attach to opponent
		if (pos.playerId !== opponentPlayer.id) return 'NO'

		// we don't care if there's a hermit there or not
		return 'YES'
	}
}

export default StringEffectCard
