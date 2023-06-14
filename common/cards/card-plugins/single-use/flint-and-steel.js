import SingleUseCard from './_single-use-card'
import {discardCard, drawCards} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class FlintAndSteelSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'flint_&_steel',
			name: 'Flint & Steel',
			rarity: 'common',
			description: "Discard your hand. Draw 3 cards.\n\nCan be used even if you do not have any cards in your hand.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos
		if (player.hand.length < 3) return 'NO'

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

		for (const card of player.hand) {
			discardCard(game, card)
		}

		drawCards(player, 3)
	}
}

export default FlintAndSteelSingleUseCard
