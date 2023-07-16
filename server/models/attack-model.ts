import {
	AttackDamageChange,
	AttackDefs,
	AttackType,
	ShouldIgnoreCard,
} from '../../common/types/attack'
import {RowPos} from '../../common/types/cards'

export class AttackModel {
	/** The damage this attack does */
	private damage: number = 0
	/** The damage multiplier */
	private damageMultiplier: number = 1
	/** The damage reduction */
	private damageReduction: number = 0
	/** Is the damage on this attack changeable? */
	private damageLocked: boolean = false
	/** The list of all changes made to this attacks damage */
	private damageChanges: Array<AttackDamageChange> = []

	/** Is this attack a backlash attack*/
	public isBacklash: boolean = false

	// Public fields

	/** Unique id for this attack */
	public id: string | null = null
	/** The attack type */
	public type: AttackType
	/** The attacker */
	public attacker: RowPos | null
	/** The attack target */
	public target: RowPos | null
	/** Attacks to perform after this attack */
	public nextAttacks: Array<AttackModel> = []
	/** Array of checks to filter out hooks this attack should not trigger */
	public shouldIgnoreCards: Array<ShouldIgnoreCard> = []

	constructor(defs: AttackDefs) {
		this.id = defs.id || null
		this.type = defs.type
		this.isBacklash = defs.isBacklash || false

		this.attacker = defs.attacker || null
		this.target = defs.target || null
		this.shouldIgnoreCards = defs.shouldIgnoreCards || []

		return this
	}

	public getDamage() {
		return this.damage
	}
	public getDamageMultiplier() {
		return this.damageMultiplier
	}
	public getDamageChanges() {
		return this.damageChanges
	}

	/** Returns true if one of the passed in types are this attacks type */
	public isType(...types: Array<AttackType>) {
		return types.includes(this.type)
	}

	/** Adds damage to the attack */
	public addDamage(sourceId: string, amount: number) {
		if (this.damageLocked) return this
		this.damage += amount

		this.damageChanges.push({
			sourceId,
			type: 'add',
			value: amount,
		})

		return this
	}

	/** Add damage reduction to the attack*/
	public reduceDamage(sourceId: string, amount: number) {
		if (this.damageLocked) return this
		this.damageReduction += amount

		this.damageChanges.push({
			sourceId,
			type: 'reduce',
			value: amount,
		})

		return this
	}

	/** Multiplies damage for the attack */
	public multiplyDamage(sourceId: string, multiplier: number) {
		if (this.damageLocked) return this
		this.damageMultiplier = Math.max(this.damageMultiplier * multiplier, 0)

		this.damageChanges.push({
			sourceId,
			type: 'multiply',
			value: multiplier,
		})

		return this
	}

	/** Calculates the damage for this attack */
	public calculateDamage() {
		return Math.max(this.damage * this.damageMultiplier - this.damageReduction, 0)
	}

	/**
	 * Locks damage for this attack
	 *
	 * WARNING: Do not use lightly!
	 */
	public lockDamage() {
		this.damageLocked = true
		return this
	}

	/** Adds a new attack to be executed after this one */
	public addNewAttack(newAttack: AttackModel) {
		this.nextAttacks.push(newAttack)
		return this
	}
}
