import {AttackModel} from '../../../../server/models/attack-model'
import Card from '../_card'

/**
 * @typedef {import('models/attack-model').AttackResult} AttackResult
 */

class HermitCard extends Card {
	constructor(defs) {
		defs.type = 'hermit'
		super(defs)

		if (!defs.health || !defs.primary || !defs.secondary || !defs.hermitType) {
			throw new Error('Invalid card definition')
		}
		this.health = defs.health
		this.primary = defs.primary
		this.secondary = defs.secondary
		/** @type {import('common/types/cards').HermitTypeT} */
		this.hermitType = defs.hermitType
	}

	/**
	 * Creates and returns attack objects
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('models/attack-model').HermitAttackType} hermitAttackType
	 * @returns {Array<AttackModel>}
	 * @abstract
	 */
	getAttacks(game, instance, hermitAttackType) {
		throw new Error('Implement getAttacks!')
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
		attack.addDamage(attack.type === 'primary' ? this.primary.damage : this.secondary.damage)
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

	/**
	 * Called when this instance will die -
	 * before the cards are removed from the board
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onHermitDeath(game, instance) {}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slotType !== 'hermit') return false
		if (pos.playerId !== currentPlayer.id) return false

		return true
	}
  
	getBackground() {
		return this.id.split('_')[0]
	}
}

export default HermitCard
