import {AttackModel} from '../../../../server/models/attack-model'
import Card from '../_card'

/**
 * @typedef {import('common/types/cards').SingleUseDefs} SingleUseDefs
 * @typedef {import('models/attack-model').AttackResult} AttackResult
 * @typedef {import('utils').GameModel} GameModel
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
	 * Creates and returns attack objects
	 * @param {GameModel} game
	 * @param {string} instance
	 * @returns {Array<AttackModel>}
	 */
	getAttacks(game, instance) {
		// default is do nothing
		return []
	}

	/**
	 * Called before any attack from our side of the board to the other
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	overrideAttack(game, instance, attack) {
		// default is do nothing
	}

	/**
	 * Called during an attack to another row
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	onAttack(game, instance, attack) {
		// default is do nothing
	}

	/**
	 * Called after damage has been applied from attack to another row
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackResult} attackResult
	 */
	afterAttack(game, instance, attackResult) {
		// default is do nothing
	}

	/**
	 * Called after damage has been applied from attack on this row
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackResult} attackResult
	 */
	afterDefence(game, instance, attackResult) {
		// default is do nothing
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {PickedCardsInfo} pickedCards
	 * @returns {"DONE" | "INVALID"}
	 */
	onApply(game, instance, pickedCards) {
		// default is do nothing
		return 'DONE'
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (pos.slotType !== 'single_use') return false

		return true
	}
}

export default SingleUseCard
