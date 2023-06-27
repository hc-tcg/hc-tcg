export class AttackModel {
	// Private fields - how did I not know this existed?

	/**
	 * The damage this attack does
	 * @type {number}
	 */
	#damage = 0
	/**
	 * The damage multiplier
	 * @type {number}
	 */
	#damageMultiplier = 1
	/**
	 * The damage reduction
	 * @type {number}
	 */
	#damageReduction = 0
	/**
	 * Is the damage on this attack changeable?
	 * @type {boolean}
	 */
	#damageLocked = false
	/**
	 * Is this attack a backlash atack
	 * @type {boolean}
	 */
	isBacklash = false

	/**
	 * The list of all changes made to this attacks damage
	 * @type {Array<import("types/attack").AttackDamageChange>}
	 */
	#damageChanges = []

	// Public fields

	/**
	 * Unique id for this attack
	 * @type {string | undefined}
	 */
	id
	/**
	 * The attack type
	 * @type {import("types/attack").AttackType}
	 */
	type

	/**
	 * The attacker
	 * @type {import("types/cards").RowPos | null}
	 */
	attacker

	/**
	 * The attack target
	 * @type {import("types/cards").RowPos | null}
	 */
	target

	/**
	 * Attacks to perform after this attack
	 * @type {Array<AttackModel>}
	 */
	nextAttacks = []

	/**
	 * Array of checks to filter out card code this attack should not trigger
	 * @type {Array<import("types/attack").ShouldIgnoreCard>}
	 */
	shouldIgnoreCards = []

	/**
	 * Creates a new attack
	 * @param {import("types/attack").AttackDefs} defs
	 */
	constructor(defs) {
		this.id = defs.id
		this.type = defs.type
		this.isBacklash = defs.isBacklash || false

		this.attacker = defs.attacker || null
		this.target = defs.target || null
		this.shouldIgnoreCards = defs.shouldIgnoreCards || []

		return this
	}

	getDamage() {
		return this.#damage
	}
	getDamageMultiplier() {
		return this.#damageMultiplier
	}
	getDamageChanges() {
		return this.#damageChanges
	}

	/**
	 * Returns true if one of the passed in types are this attacks type
	 * @param  {...import("types/attack").AttackType} types
	 */
	isType(...types) {
		return types.includes(this.type)
	}

	/**
	 * Adds damage to the attack
	 * @param {string} sourceId
	 * @param {number} amount
	 */
	addDamage(sourceId, amount) {
		if (this.#damageLocked) return this
		this.#damage += amount

		this.#damageChanges.push({
			sourceId,
			type: 'add',
			value: amount,
		})

		return this
	}

	/**
	 * Removes damage from the attack
	 * @param {string} sourceId
	 * @param {number} amount
	 */
	reduceDamage(sourceId, amount) {
		if (this.#damageLocked) return this
		this.#damageReduction += amount

		this.#damageChanges.push({
			sourceId,
			type: 'reduce',
			value: amount,
		})

		return this
	}

	/**
	 * Multiplies damage for the attack
	 * @param {string} sourceId
	 * @param {number} multiplier
	 */
	multiplyDamage(sourceId, multiplier) {
		if (this.#damageLocked) return this
		this.#damageMultiplier = Math.max(this.#damageMultiplier * multiplier, 0)

		this.#damageChanges.push({
			sourceId,
			type: 'multiply',
			value: multiplier,
		})

		return this
	}

	/**
	 * Calculates the damage for this attack
	 * @returns {number}
	 */
	calculateDamage() {
		return Math.max(this.#damage * this.#damageMultiplier - this.#damageReduction, 0)
	}

	/**
	 * Locks damage for this attack
	 *
	 * WARNING: Do not use lightly!
	 */
	lockDamage() {
		this.#damageLocked = true
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
