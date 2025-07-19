import {
	CardComponent,
	PlayerComponent,
	RowComponent,
	StatusEffectComponent,
} from '../components'
import {ComponentQuery} from '../components/query'
import {PlayerEntity, RowEntity} from '../entities'
import {
	AttackDefs,
	AttackHistory,
	AttackHistoryType,
	AttackLog,
	AttackType,
	AttackerEntity,
	WeaknessType,
} from '../types/attack'
import {GameModel} from './game-model'

export class AttackModel {
	private readonly game: GameModel
	/** The damage this attack does */
	private damage: number = 0
	/** The damage multiplier */
	private damageMultiplier: number = 1
	/** The damage reduction */
	private damageReduction: number = 0
	/** Is the damage on this attack changeable? */
	private damageLocked: boolean = false
	/** Ignores damage reduction? (also cannot be partially redirected for how it currently works)*/
	private trueDamage: boolean = false
	/** The list of all changes made to this attack */
	private history: Array<AttackHistory> = []

	/** The player that created this attack */
	private playerEntity: PlayerEntity | null

	/** The attacker */
	public attackerEntity: AttackerEntity | null
	/** The attack target */
	public targetEntity: RowEntity | null

	/** The battle log attached to this attack */
	private log: Array<(values: AttackLog) => string> = []

	// Public fields

	/** Unique id for this attack */
	public id: string | null = null
	/** The attack type */
	public type: AttackType
	/** Attacks to perform after this attack */
	public nextAttacks: Array<AttackModel> = []
	/** Array of checks to filter out hooks this attack should not trigger */
	public shouldIgnoreCards: Array<ComponentQuery<CardComponent>> = []
	/** Is this attack a backlash attack*/
	public isBacklash: boolean = false
	/** Whether or not the attack should create a weakness attack */
	public createWeakness: WeaknessType

	constructor(game: GameModel, defs: AttackDefs) {
		this.game = game
		this.type = defs.type
		this.isBacklash = defs.isBacklash || false
		this.trueDamage = defs.trueDamage || false

		this.attackerEntity = defs.attacker || null
		this.targetEntity = defs.target || null
		this.shouldIgnoreCards = defs.shouldIgnoreSlots || []
		this.createWeakness = defs.createWeakness || 'never'

		if ('player' in defs) {
			this.playerEntity = defs.player
		} else {
			this.playerEntity = null
		}

		if (defs.log) this.log.push(defs.log)

		return this
	}

	// Helpers

	/** Adds a change to the attack's history */
	private addHistory(
		source: AttackerEntity,
		type: AttackHistoryType,
		value?: any,
	) {
		this.history.push({
			source,
			type,
			value,
		})
	}

	/** Returns true if one of the passed in types are this attacks type */
	public isType<This extends {type: AttackType}, T extends AttackType>(
		this: This,
		...types: Array<T>
	): this is This & {type: T} {
		return (types as Array<AttackType>).includes(this.type)
	}

	/** Return the player that created this attack. For cards, this is the player who owns the card.
	 * For status effects this is provided in the constructor.
	 */
	get player(): PlayerComponent {
		if (this.playerEntity) {
			return this.game.components.getOrError(this.playerEntity)
		} else if (this.attackerEntity === 'debug') {
			return this.game.currentPlayer
		} else {
			let card = this.game.components.get(this.attackerEntity) as CardComponent
			return card.player
		}
	}

	/** Returns true if the attacker is a given status effect or card component.*/
	public isAttacker(component: AttackerEntity | null | undefined) {
		return this.attacker?.entity === component
	}

	/** Returns true if this attack is targetting a card in a specific row */
	public isTargeting(card: CardComponent) {
		return card.slot.inRow() && card.slot.row.entity === this.target?.entity
	}

	/** Calculates the damage for this attack */
	public calculateDamage() {
		return Math.max(
			this.damage * this.damageMultiplier -
				(this.trueDamage ? 0 : this.damageReduction),
			0,
		)
	}

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
		return [...this.history]
	}

	/** Returns the current attacker for this attack */
	get attacker(): CardComponent | StatusEffectComponent | null {
		if (this.attackerEntity === 'debug') return null
		return this.game.components.get(this.attackerEntity)
	}

	/** Returns the current target for this attack */
	get target(): RowComponent | null {
		return this.game.components.get(this.targetEntity)
	}

	// Setters / modifier methods

	/** Increases the base damage the attack does */
	public addDamage(source: AttackerEntity, amount: number) {
		if (this.damageLocked) return this
		this.damage += amount

		this.addHistory(source, 'add_damage', amount)

		return this
	}

	/** Reduces the base damage of the attack (before multiplication) */
	public removeDamage(source: AttackerEntity, amount: number) {
		if (this.damageLocked) return this
		this.damage -= amount

		this.addHistory(source, 'remove_damage', amount)

		return this
	}

	/** Reduces the total damage the attack does */
	public addDamageReduction(source: AttackerEntity, amount: number) {
		if (this.damageLocked) return this
		this.damageReduction += amount

		this.addHistory(source, 'add_damage_reduction', amount)

		return this
	}

	/** Multiplies the damage the attack does */
	public multiplyDamage(source: AttackerEntity, multiplier: number) {
		if (this.damageLocked) return this
		this.damageMultiplier = Math.max(this.damageMultiplier * multiplier, 0)

		this.addHistory(source, 'multiply_damage', multiplier)
		return this
	}

	/** Sets the attacker for this attack */
	public setAttacker(attacker: AttackerEntity) {
		this.addHistory(attacker, 'set_attacker', attacker)
		return this
	}

	/** Sets the target for this attack. Unlike redirect, this does not trigger Chainmail Armor. */
	public setTarget(sourceId: AttackerEntity, target: RowEntity | null) {
		this.targetEntity = target
		this.addHistory(sourceId, 'set_target', target)
		return this
	}

	/** Redirect the attack to another hermit. Unlike setTarget, this will trigger Chainmail Armor. */
	public redirect(sourceId: AttackerEntity, target: RowEntity | null) {
		this.addHistory(sourceId, 'redirect', {from: this.targetEntity, to: target})
		this.targetEntity = target
		return this
	}

	/**
	 * Locks damage for this attack
	 *
	 * WARNING: Do not use lightly!
	 */
	public lockDamage(source: AttackerEntity) {
		this.damageLocked = true

		this.addHistory(source, 'lock_damage')
		return this
	}

	/** Adds a new attack to be executed after this one */
	public addNewAttack(newAttack: AttackModel) {
		this.nextAttacks.push(newAttack)
		return this
	}

	/** Updates the log entry*/
	public updateLog(logEntry: (values: AttackLog) => string) {
		this.log.push(logEntry)
	}

	private consolidateLogs(values: AttackLog, logIndex: number) {
		if (logIndex > 0) {
			values.previousLog = this.consolidateLogs(values, logIndex - 1)
		}
		return this.log[logIndex](values)
	}

	/** Gets the log entry for this attack*/
	public getLog(values: AttackLog) {
		if (this.log.length === 0) {
			return ''
		}
		return this.consolidateLogs(values, this.log.length - 1)
	}
}

/** Safety type to prevent hooks modifying attack values */
export type ReadonlyAttackModel = Omit<
	Readonly<AttackModel>,
	| 'redirect'
	| 'addDamage'
	| 'removeDamage'
	| 'addDamageReduction'
	| 'multiplyDamage'
	| 'setAttacker'
	| 'setTarget'
	| 'redirect'
	| 'addNewAttack'
	| 'updateLog'
>
