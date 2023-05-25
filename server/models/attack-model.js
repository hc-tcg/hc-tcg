/**
 * @typedef {{index: number, row: RowStateWithHermit} | null} Attacker
 *
 * @typedef {{index: number, row: RowStateWithHermit}} AttackTarget
 *
 * @typedef {'primary' | 'secondary' | 'zero'} HermitAttackType
 *
 * @typedef {HermitAttackType | 'effect' | 'weakness' | 'backlash' | 'ailment'} AttackType
 *
 * @typedef {{damageReduction: number, backlash: number}} AttackDefence
 *
 *
 * @typedef {{attack: AttackModel, totalDamage: number, blockedDamage: number}} AttackResult
 */

export class AttackModel {
	/**
	 *
	 * @param {Attacker} attacker
	 * @param {AttackTarget} target
	 * @param {AttackType} type
	 * @returns
	 */
	constructor(attacker = null, target, type) {
		/**
		 * The attacker
		 * @type {Attacker}
		 */
		this.attacker = attacker

		/**
		 * The attack target
		 * @type {AttackTarget}
		 */
		this.target = target

		/**
		 * The attack type
		 * @type {AttackType}
		 */
		this.type = type

		/**
		 * The damage this attack does
		 * @type {number}
		 */
		this.damage = 0

		/**
		 * The damage multiplier
		 * @type {number}
		 */
		this.damageMultiplier = 1

		/**
		 * Is the damage on this attack changeable?
		 * @type {boolean}
		 */
		this.damageLocked = false

		/**
		 * Defence against this attack
		 * @type {AttackDefence}
		 */
		this.defence = {
			damageReduction: 0,
			backlash: 0,
		}

		// uncategorised @TODO
		/** @type {boolean} */
		this.ignoreAttachedEffects = false

		return this
	}

	/**
	 * Adds damage to a damage source
	 * @param {number} amount
	 */
	addDamage(amount) {
		if (this.damageLocked) return this
		this.damage += amount
		return this
	}

	/**
	 * Removes damage from a damage source
	 * @param {number} amount
	 */
	removeDamage(type, amount) {
		if (this.damageLocked) return this
		this.damage = Math.max(this.damage - amount, 0)
		return this
	}

	/**
	 * Multiplies damage for a damage source
	 * @param {number} multiplier
	 */
	multiplyDamage(multiplier) {
		if (this.damageLocked) return this
		this.damageMultiplier = Math.max(this.damageMultiplier * multiplier, 0)
		return this
	}

	/**
	 * Locks damage for this attack
	 *
	 * WARNING: Do not use lightly!
	 */
	lockDamage() {
		this.damageLocked = true
		return this
	}
}
