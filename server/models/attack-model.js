/**
 * @typedef {'standard' | 'backlash' | 'ailment'} AttackType
 *
 * @typedef {'mainAttack' | 'effects' | 'weakness'} DamageType
 *
 * @typedef {{amount: number, multiplier: number, locked: boolean}} DamageSource
 *
 * @typedef {Record<DamageType, DamageSource>} DamageSources
 *
 * @typedef {{damageReduction: number, backlash: number}} AttackDefence
 *
 *
 * @typedef {{attacker: RowStateWithHermit, target: RowStateWithHermit, totalDamage: number, blockedDamage: number}} AttackResult
 */

export class AttackModel {
	/**
	 *
	 * @param {RowStateWithHermit | null} attacker
	 * @param {RowStateWithHermit} target
	 * @param {AttackType} type
	 * @returns
	 */
	constructor(attacker = null, target, type) {
		/**
		 * The attacker
		 * @type {RowStateWithHermit | null}
		 */
		this.attacker = attacker

		/**
		 * The attack target
		 * @type {RowStateWithHermit}
		 */
		this.target = target

		/**
		 * The attack type
		 * @type {AttackType}
		 */
		this.type = type

		/**
		 * Where the damage is coming from
		 * @type {DamageSources}
		 */
		this.sources = {
			mainAttack: {amount: 0, multiplier: 1, locked: false},
			effects: {amount: 0, multiplier: 1, locked: false},
			weakness: {amount: 0, multiplier: 1, locked: false},
		}

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
	 * @param {DamageType} type
	 * @param {number} amount
	 */
	addDamage(type, amount) {
		if (this.sources[type].locked) return this
		this.sources[type].amount += amount
		return this
	}

	/**
	 * Removes damage from a damage source
	 * @param {DamageType} type
	 * @param {number} amount
	 */
	removeDamage(type, amount) {
		if (this.sources[type].locked) return this
		this.sources[type].amount = Math.max(this.sources[type].amount - amount, 0)
		return this
	}

	/**
	 * Multiplies damage for a damage source
	 * @param {DamageType} type
	 * @param {number} multiplier
	 */
	multiplyDamage(type, multiplier) {
		const source = this.sources[type]
		if (source.locked) return this
		source.multiplier = Math.max(source.multiplier * multiplier, 0)
		this.sources[type] = source
		return this
	}

	/**
	 * Locks damage for a damage source
	 *
	 * WARNING: Do not use lightly!
	 * @param {DamageType} type
	 */
	lockDamage(type) {
		this.sources[type].locked = true
		return this
	}

	/**
	 * Returns an array of the different damage types
	 * @returns {Array<DamageType>}
	 */
	getDamageTypes() {
		/** @type {Array<DamageType>} */
		const types = ['mainAttack', 'effects', 'weakness']
		return types
	}
}
