import {AttackModel} from '../../../../server/models/attack-model'
import Card from '../_card'

/**
 * @typedef {import('common/types/cards').EffectDefs} EffectDefs
 * @typedef {import('common/types/cards').CardTypeT} CardTypeT
 * @typedef {import('models/attack-model').AttackResult} AttackResult
 * @typedef {import('utils').GameModel} GameModel
 */

class EffectCard extends Card {
	/**
	 * @param {EffectDefs} defs
	 */
	constructor(defs) {
		super({
			type: 'effect',
			id: defs.id,
			name: defs.name,
			rarity: defs.rarity,
			pickOn: defs.pickOn,
			pickReqs: defs.pickReqs,
		})

		if (!defs.description) {
			throw new Error('Invalid card definition!')
		}

		/** @type {string} */
		this.description = defs.description
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slotType !== 'effect') return false
		if (pos.playerId !== currentPlayer.id) return false

		if (!pos.rowState?.hermitCard) return false

		return true
	}

	/**
	 * Returns whether this card is removable from its position
	 * @param {GameModel} game
	 * @param {string} instance
	 * @returns {boolean}
	 */
	getIsRemovable(game, instance) {
		// default
		return true
	}

	/**
	 * Returns an array of attack objects to carry out
	 * @param {GameModel} game
	 * @param {string} instance
	 * @returns {Array<AttackModel>}
	 */
	getAttacks(game, instance) {
		// default is none
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
	 * Called before any attack to our side of the board
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	overrideDefence(game, instance, attack) {
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
	 * Called during an attack on this row
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	onDefence(game, instance, attack) {
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

	//@TODO we need methods here that cards can do stuff in, but as few as possible
	/*
	available actions?
	*/

	/**
	 * Called at the start of a turn
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onTurnStart(game, instance) {
		// default is do nothing
	}

	/**
	 * Called at the end of a turn
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onTurnEnd(game, instance) {
		// default is do nothing
	}

	/**
	 * Called when the hermit this instance is attached to will die -
	 * before the cards are removed from the board
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onHermitDeath(game, instance) {}

	/**
	 * Called before the row is set to inactive
	 * @param {GameModel} game
	 * @param {string} instance
	 * @returns {boolean} Whether this row can become inactive
	 */
	onSetInactive(game, instance) {
		return true
	}

	/**
	 * Called before the row is set to active
	 * @param {GameModel} game
	 * @param {string} instance
	 * @returns {boolean} Whether this row can become active
	 */
	onSetActive(game, instance) {
		return true
	}
}

export default EffectCard
