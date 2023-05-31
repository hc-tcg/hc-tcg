import {AttackModel} from '../../../../server/models/attack-model'
import {GameModel} from '../../../../server/models/game-model'
import {getCardPos} from '../../../../server/utils/cards'
import Card from '../_card'

/**
 * @typedef {import('../../../types/cards').HermitDefs} HermitDefs
 * @typedef {import('../../../types/cards').HermitTypeT} HermitTypeT
 * @typedef {import('../../../types/cards').HermitAttackInfo} HermitAttackInfo
 */

class HermitCard extends Card {
	/**
	 * @param {HermitDefs} defs
	 */
	constructor(defs) {
		super({
			type: 'hermit',
			id: defs.id,
			name: defs.name,
			rarity: defs.rarity,
			pickOn: defs.pickOn,
			pickReqs: defs.pickReqs,
		})

		if (!defs.hermitType || !defs.health || !defs.primary || !defs.secondary) {
			throw new Error('Invalid card definition')
		}

		/** @type {HermitTypeT} */
		this.hermitType = defs.hermitType

		/** @type {number} */
		this.health = defs.health

		/** @type {HermitAttackInfo} */
		this.primary = defs.primary

		/** @type {HermitAttackInfo} */
		this.secondary = defs.secondary
	}

	/**
	 * Creates and returns attack objects
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/attack').HermitAttackType} hermitAttackType
	 * @returns {Array<AttackModel>}
	 */
	getAttacks(game, instance, hermitAttackType) {
		// default implemetation is to just create an empty attack to the opposing hermit
		const pos = getCardPos(game, instance)
		if (!pos || !pos.rowIndex || !pos.rowState) return []
		if (!pos.rowState.hermitCard) return []

		const {opponentPlayer} = game.ds
		const opponentActiveIndex = opponentPlayer.board.activeRow
		if (!opponentActiveIndex) return []

		const targetRow = opponentPlayer.board.rows[opponentActiveIndex]
		if (!targetRow.hermitCard) return []

		// Create an attack from us to them, with no damage yet
		const emptyAttack = new AttackModel({
			attacker: {
				index: pos.rowIndex,
				row: pos.rowState,
			},
			target: {
				index: opponentActiveIndex,
				row: targetRow,
			},
			type: hermitAttackType,
		})

		return [emptyAttack]
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
		// default is to add the defined damage for our attacks
		if (attack.type === 'primary') {
			attack.addDamage(this.primary.damage)
		} else if (attack.type === 'secondary') {
			attack.addDamage(this.secondary.damage)
		}
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
	 * @param {import("common/types/attack").AttackResult} attackResult
	 */
	afterAttack(game, instance, attackResult) {
		// default is do nothing
	}

	/**
	 * Called after damage has been applied from attack on this row
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import("common/types/attack").AttackResult} attackResult
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
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slotType !== 'hermit') return false
		if (pos.playerId !== currentPlayer.id) return false

		return true
	}

	/**
	 * Returns the background to use for this hermit card
	 * @returns {string}
	 */
	getBackground() {
		return this.id.split('_')[0]
	}
}

export default HermitCard
