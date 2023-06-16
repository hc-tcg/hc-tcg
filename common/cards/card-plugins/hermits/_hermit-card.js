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
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('../../../types/attack').HermitAttackType} hermitAttackType
	 * @param {import('../../../types/pick-process').PickedSlots} pickedSlots
	 * @returns {Array<AttackModel>}
	 */
	getAttacks(game, instance, pos, hermitAttackType, pickedSlots) {
		if (pos.rowIndex === null || !pos.row || !pos.row.hermitCard) return []

		const {opponentPlayer} = game.ds
		const targetIndex = opponentPlayer.board.activeRow
		if (targetIndex === null) return []

		const targetRow = opponentPlayer.board.rows[targetIndex]
		if (!targetRow.hermitCard) return []

		// Create an attack with default damage
		const attack = new AttackModel({
			id: this.getInstanceKey(instance),
			attacker: {
				index: pos.rowIndex,
				row: pos.row,
			},
			target: {
				index: targetIndex,
				row: targetRow,
			},
			type: hermitAttackType,
		})
		if (attack.type === 'primary') {
			attack.addDamage(this.primary.damage)
		} else if (attack.type === 'secondary') {
			attack.addDamage(this.secondary.damage)
		}

		return [attack]
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slot.type !== 'hermit') return 'INVALID'
		if (pos.playerId !== currentPlayer.id) return 'INVALID'

		return 'YES'
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
