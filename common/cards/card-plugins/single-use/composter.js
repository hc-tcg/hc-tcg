import SingleUseCard from './_single-use-card'
import {equalCard, discardCard, drawCards} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class ComposterSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'composter',
			name: 'Composter',
			rarity: 'common',
			description:
				"Discard 2 cards in your hand. Draw 2.\n\nCan not be used if you do not have 2 cards to discard.",
		
			pickOn: 'apply',
			pickReqs: /** @satisfies {Array<PickRequirmentT>} */ ([
				{target: 'hand', type: ['hermit', 'effect', 'item', 'single_use'], amount: 2},
			])
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
	

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const slots = pickedSlots[this.id] || []
		const {player} = pos

		if (slots.length !== 2) return
		
		const pickedCard1 = slots[0]
		const pickedCard2 = slots[1]

		if (pickedCard1.slot.card === null || pickedCard2.slot.card === null) return

		// @TODO Check on ValidPicks instead
		if (equalCard(pickedCard1.slot.card, pickedCard2.slot.card)) return

		discardCard(game, pickedCard1.slot.card)
		discardCard(game, pickedCard2.slot.card)

		drawCards(player, 2)
	}
}

export default ComposterSingleUseCard
