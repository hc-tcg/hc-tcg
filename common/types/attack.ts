import {SlotCondition} from '../filters'
import {CardEntity, RowEntity, StatusEffectEntity} from './game-state'

export type HermitAttackType = 'primary' | 'secondary' | 'single-use'

export type AttackType = HermitAttackType | 'effect' | 'weakness' | 'status-effect'

export type WeaknessType = 'always' | 'ifWeak' | 'never'

export type AttackDefence = {
	damageReduction: number
}

export type ShouldIgnoreCard = SlotCondition

export type AttackLog = {
	/**The default log for attacks.*/
	defaultLog: string
	/**The name of attacker of this attack.*/
	attacker: string
	/**For Hermit attacks, the name of this attack.*/
	attackName: string
	/**The name of the player that created this attack.*/
	player: string
	/**The name of the player who's the target of this attack.*/
	opponent: string
	/**The name of target of this attack.*/
	target: string
	/**The damage this attack deals.*/
	damage: string
	/**The coinflip for this attack.*/
	coinFlip: string | null
	/**The previously defined log entry.*/
	previousLog?: string
}

export type AttackerEntity = CardEntity | StatusEffectEntity

export type AttackDefs = {
	attacker?: AttackerEntity | null
	target?: RowEntity | null
	type: AttackType
	shouldIgnoreSlots?: Array<ShouldIgnoreCard>
	isBacklash?: boolean
	createWeakness?: WeaknessType
	log?: (values: AttackLog) => string
}

export type AttackHistoryType =
	| 'add_damage'
	| 'reduce_damage'
	| 'multiply_damage'
	| 'lock_damage'
	| 'set_attacker'
	| 'set_target'

export type AttackHistory = {
	source: AttackerEntity,
	type: AttackHistoryType
	value?: any
}
