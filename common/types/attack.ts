import {RowPos} from './cards'

export type HermitAttackType = 'primary' | 'secondary' | 'single-use'

export type AttackType = HermitAttackType | 'effect' | 'weakness' | 'status-effect'

export type WeaknessType = 'always' | 'ifWeak' | 'never'

export type AttackDefence = {
	damageReduction: number
}

export type ShouldIgnoreCard = (instance: string) => boolean

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

export type AttackDefs = {
	id?: string
	attacker?: RowPos | null
	target?: RowPos | null
	type: AttackType
	shouldIgnoreCards?: Array<ShouldIgnoreCard>
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
	sourceId: string
	type: AttackHistoryType
	value?: any
}
