export class AttackModel {
	/**
	 * Creates a new attack
	 * @param {import("common/types/attack").AttackDefs} defs
	 */
	constructor(defs) {
		/**
		 * Unique id for this attack
		 * @type {string | undefined}
		 */
		this.id = defs.id
		/**
		 * The attacker
		 * @type {import("common/types/attack").Attacker | undefined}
		 */
		this.attacker = defs.attacker

		/**
		 * The attack target
		 * @type {import("../../common/types/game-state").RowInfo}
		 */
		this.target = defs.target

		/**
		 * The attack type
		 * @type {import("common/types/attack").AttackType}
		 */
		this.type = defs.type

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
		 * @type {import("common/types/attack").AttackDefence}
		 */
		this.defence = {
			damageReduction: 0,
		}

		/** @type {Array<import("common/types/attack").ShouldIgnoreCard>} */
		this.shouldIgnoreCards = defs.shouldIgnoreCards || []

		/**
		 * Attacks to perform after this attack
		 * @type {Array<AttackModel>}
		 */
		this.nextAttacks = []

		return this
	}

	/**
	 * Adds damage to the attack
	 * @param {number} amount
	 */
	addDamage(amount) {
		if (this.damageLocked) return this
		this.damage += amount
		return this
	}

	/**
	 * Removes damage from the attack
	 * @param {number} amount
	 */
	reduceDamage(amount) {
		if (this.damageLocked) return this
		this.damage = Math.max(this.damage - amount, 0)
		return this
	}

	/**
	 * Multiplies damage for the attack
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

	/**
	 * Adds a new attack to be executed after this one
	 * @param {AttackModel} newAttack
	 */
	addNewAttack(newAttack) {
		this.nextAttacks.push(newAttack)
		return this
	}
}
