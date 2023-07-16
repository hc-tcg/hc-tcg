import {RowPos} from './cards'

export type HermitAttackType = 'primary' | 'secondary' | 'zero'

export type AttackType = HermitAttackType | 'effect' | 'weakness' | 'ailment'

export type AttackDefence = {
	damageReduction: number
}

export type ShouldIgnoreCard = (instance: string) => boolean

export type AttackDefs = {
	id?: string
	attacker?: RowPos | null
	target?: RowPos | null
	type: AttackType
	shouldIgnoreCards?: Array<ShouldIgnoreCard>
	isBacklash?: boolean
}

export type AttackDamageChange = {
	sourceId: string
	type: 'add' | 'reduce' | 'multiply'
	value: number
}
