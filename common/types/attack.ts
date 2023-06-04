import {AttackModel} from '../../server/models/attack-model'
import {RowInfo, RowStateWithHermit} from './game-state'

export type Attacker = RowInfo | null

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

export type AttackDefs = {
	id?: string
	attacker?: Attacker
	target: RowInfo
	type: AttackType
}
