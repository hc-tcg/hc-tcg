import {PickRequirmentT} from './pick-process'

export type CardRarityT = 'common' | 'rare' | 'ultra_rare'

export type HermitTypeT =
	| 'balanced'
	| 'builder'
	| 'speedrunner'
	| 'redstone'
	| 'farm'
	| 'pvp'
	| 'terraform'
	| 'prankster'
	| 'miner'
	| 'explorer'
	| 'any'

export type DamageT = {
	target?: number
	afkTarget?: number
	self?: number
}

export type ProtectionT = {
	target: number
	discard?: boolean
}

export type AnyCardT = {
	name: string
	type: string
	rarity: CardRarityT
	id: string
	pickOn?: 'attack' | 'apply' | 'followup' | 'custom'
	useReqs?: Array<PickRequirmentT>
	pickReqs?: Array<PickRequirmentT>
}

export type ItemCardT = AnyCardT & {
	type: 'item'
	hermitType: HermitTypeT
}

export type EffectCardT = AnyCardT & {
	type: 'effect' | 'single_use'
	description: string
	damage?: DamageT
	protection?: ProtectionT
}

export type HealthCardT = AnyCardT & {
	type: 'health'
	health: number
}

export type HermitAttackT = {
	name: string
	cost: Array<string>
	damage: number
	power: string | null
}

export type HermitCardT = AnyCardT & {
	type: 'hermit'
	hermitType: HermitTypeT
	health: number
	primary: HermitAttackT
	secondary: HermitAttackT
}

export type CardInfoT = ItemCardT | EffectCardT | HermitCardT | HealthCardT
