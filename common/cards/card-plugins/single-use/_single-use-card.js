import {AttackModel} from '../../../models/attack-model'
import Card from '../_card'

/**
 * @typedef {import('models/attack-model').AttackResult} AttackResult
 */

class SingleUseCard extends Card {
	constructor(defs) {
		defs.type = 'single_use'
		super(defs)

		if (!defs.description) {
			throw new Error('Invalid card definition')
		}
		this.description = defs.description

		this.attachReq = {target: 'player', type: ['single_use']}
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
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (pos.slotType !== 'single_use') return false

		return true
	}
}

export default SingleUseCard
