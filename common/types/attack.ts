import {AttackModel} from '../../server/models/attack-model'
import {RowPos} from './cards'

export type HermitAttackType = 'primary' | 'secondary' | 'zero'

export type AttackType = HermitAttackType | 'effect' | 'weakness' | 'ailment'

export type AttackDefence = {
	damageReduction: number
}

export type ShouldIgnoreCard = (instance: string) => boolean

export type AttackDefs = {
	id?: string
	attacker?: RowPos
	target: RowPos
	type: AttackType
	shouldIgnoreCards?: Array<ShouldIgnoreCard>
}

export type AttackDamageChange = {
	sourceId: string
	type: 'add' | 'reduce' | 'multiply'
	value: number
}
