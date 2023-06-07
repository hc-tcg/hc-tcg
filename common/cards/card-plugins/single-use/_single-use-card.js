import {AttackModel} from '../../../../server/models/attack-model'
import {GameModel} from '../../../../server/models/game-model'
import Card from '../_card'

/**
 * @typedef {import('../../../types/cards').SingleUseDefs} SingleUseDefs
 * @typedef {import('../../../types/cards').CardPos} CardPos
 * @typedef {import('common/types/attack').AttackResult} AttackResult
 * @typedef {import('../../../types/pick-process').PickedSlots} PickedSlots
 */

class SingleUseCard extends Card {
	/**
	 * @param {SingleUseDefs} defs
	 */
	constructor(defs) {
		super({
			type: 'single_use',
			id: defs.id,
			name: defs.name,
			rarity: defs.rarity,
			pickOn: defs.pickOn,
			pickReqs: defs.pickReqs,
		})

		if (!defs.description) {
			throw new Error('Invalid card definition')
		}
		/** @type {string} */
		this.description = defs.description
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {"YES" | "NO" | "INVALID"}
	 */
	canAttach(game, pos) {
		if (pos.slot.type !== 'single_use') return 'INVALID'

		return 'YES'
	}

	/**
	 * Returns whether this card has apply functionality or not
	 * @returns {boolean}
	 */
	canApply() {
		// default is no
		return false
	}

	/**
	 * Called when an instance of this card is applied
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		// default is do nothing
	}
}

export default SingleUseCard
