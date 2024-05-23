import {
	AttackHistory,
	AttackHistoryType,
	AttackDefs,
	AttackType,
	ShouldIgnoreCard,
	WeaknessType,
	AttackLogFactory,
} from '../types/attack'
import {RowPos} from '../types/cards'

export class AttackModel {
	/** The damage this attack does */
	private damage: number = 0
	/** The damage multiplier */
	private damageMultiplier: number = 1
	/** The damage reduction */
	private damageReduction: number = 0
	/** Is the damage on this attack changeable? */
	private damageLocked: boolean = false
	/** The list of all changes made to this attack */
	private history: Array<AttackHistory> = []

	/** The attacker */
	private attacker: RowPos | null
	/** The attack target */
	private target: RowPos | null

	/** The battle log attached to this attack */
	public log: (values: AttackLogFactory) => string

	// Public fields

	/** Unique id for this attack */
	public id: string | null = null
	/** The attack type */
	public type: AttackType
	/** Attacks to perform after this attack */
	public nextAttacks: Array<AttackModel> = []
	/** Array of checks to filter out hooks this attack should not trigger */
	public shouldIgnoreCards: Array<ShouldIgnoreCard> = []
	/** Is this attack a backlash attack*/
	public isBacklash: boolean = false
	/** Whether or not the attack should create a weakness attack */
	public createWeakness: WeaknessType

	constructor(defs: AttackDefs) {
		this.id = defs.id || null
		this.type = defs.type
		this.isBacklash = defs.isBacklash || false

		this.attacker = defs.attacker || null
		this.target = defs.target || null
		this.shouldIgnoreCards = defs.shouldIgnoreCards || []
		this.createWeakness = defs.createWeakness || 'never'

		this.log = defs.log
			? defs.log
			: (values) => {
					return `{Your|${values.opponent}'s} ${values.attacker} attacked ${values.target} with $v${values.attackName}$ for $b${values.damage}hp$ damage`
			  }

		return this
	}

	// Helpers

	/** Adds a change to the attack's history */
	private addHistory(sourceId: string, type: AttackHistoryType, value?: any) {
		this.history.push({
			sourceId,
			type,
			value,
		})
	}

	/** Returns true if one of the passed in types are this attacks type */
	public isType(...types: Array<AttackType>) {
		return types.includes(this.type)
	}

	/** Calculates the damage for this attack */
	public calculateDamage() {
		return Math.max(this.damage * this.damageMultiplier - this.damageReduction, 0)
	}

	// Getters

	/** Returns the damage this attack will do */
	public getDamage() {
		return this.damage
	}
	/** Returns the damage multiplier for this attack */
	public getDamageMultiplier() {
		return this.damageMultiplier
	}
	/** Returns the history of changes to this attack, optionally filtered by type */
	public getHistory(type?: AttackHistoryType) {
		if (type) {
			return this.history.filter((history) => history.type == type)
		}
		return this.history
	}
	/** Returns the current attacker for this attack */
	public getAttacker() {
		return this.attacker
	}
	/** Returns the current target for this attack */
	public getTarget() {
		return this.target
	}

	// Setters / modifier methods

	/** Increases the damage the attack does */
	public addDamage(sourceId: string, amount: number) {
		if (this.damageLocked) return this
		this.damage += amount

		this.addHistory(sourceId, 'add_damage', amount)

		return this
	}

	/** Reduces the damage the attack does */
	public reduceDamage(sourceId: string, amount: number) {
		if (this.damageLocked) return this
		this.damageReduction += amount

		this.addHistory(sourceId, 'reduce_damage', amount)

		return this
	}

	/** Multiplies the damage the attack does */
	public multiplyDamage(sourceId: string, multiplier: number) {
		if (this.damageLocked) return this
		this.damageMultiplier = Math.max(this.damageMultiplier * multiplier, 0)

		this.addHistory(sourceId, 'multiply_damage', multiplier)
		return this
	}

	/** Sets the attacker for this attack */
	public setAttacker(sourceId: string, attacker: RowPos | null) {
		this.attacker = attacker

		this.addHistory(sourceId, 'set_attacker', attacker)
		return this
	}
	/** Sets the target for this attack */
	public setTarget(sourceId: string, target: RowPos | null) {
		this.target = target

		this.addHistory(sourceId, 'set_target', target)
		return this
	}

	/**
	 * Locks damage for this attack
	 *
	 * WARNING: Do not use lightly!
	 */
	public lockDamage(sourceId: string) {
		this.damageLocked = true

		this.addHistory(sourceId, 'lock_damage')
		return this
	}

	/** Adds a new attack to be executed after this one */
	public addNewAttack(newAttack: AttackModel) {
		this.nextAttacks.push(newAttack)
		return this
	}
}
