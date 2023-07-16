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
		if (player.pile.length <= 2) return 'NO'

		return 'YES'
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			drawCards(player, 2)
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default FishingRodSingleUseCard
