import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {drawCards} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class FishingRodSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fishing_rod',
			name: 'Fishing Rod',
			rarity: 'ultra_rare',
			description: 'Draw 2 cards.',
		})
	}
	
	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos
		if (player.hand.length < 2) return 'NO'

		return 'YES'
	}
		
	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {player} = pos

		drawCards(player, 2)
	}
}

export default FishingRodSingleUseCard
