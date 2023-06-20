import {AttackModel} from '../../server/models/attack-model'
import {RowPos} from './cards'

export type Attacker = RowPos | null

export type HermitAttackType = 'primary' | 'secondary' | 'zero'

export type AttackType =
	| HermitAttackType
	| 'effect'
	| 'weakness'
	| 'backlash'
	| 'ailment'

export type AttackDefence = {
	damageReduction: number
}

export type AttackResult = {
	attack: AttackModel
	totalDamage: number
	blockedDamage: number
}

export type ShouldIgnoreCard = (instance: string) => boolean

export type AttackDefs = {
	id?: string
	attacker?: Attacker
	target: RowPos
	type: AttackType
	shouldIgnoreCards?: Array<ShouldIgnoreCard>
}
