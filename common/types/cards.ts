import {PickRequirmentT} from './pick-process'

export type CardRarityT = 'common' | 'rare' | 'ultra_rare'

export type RankT = {
	name: string
	cost: number
}

export type CharacterTypeT =
	| 'australian'
	| 'bacon'
	| 'bot'
	| 'cat'
	| 'iceCream'
	| 'minecraft'
	| 'toddler'

export type CardTypeT = 'item' | 'single_use' | 'effect' | 'character' | 'health'

export type DamageT = {
	target?: number
	afkTarget?: number
	self?: number
}

export type ProtectionT = {
	target?: number
	backlash?: number
	discard?: boolean
}

export type AttachRequirmentT = {
	target: 'player' | 'opponent'
	type: Array<CardTypeT | 'any'>
	active?: boolean
}

export type AnyCardT = {
	name: string
	type: string
	rarity: CardRarityT
	id: string
	pickOn?: 'attack' | 'apply' | 'followup' | 'use-opponent' | 'use-ally'
	useReqs?: Array<PickRequirmentT>
	pickReqs?: Array<PickRequirmentT>
	attachReq: AttachRequirmentT
}

export type ItemCardT = AnyCardT & {
	type: 'item'
	characterType: CharacterTypeT
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

export type CharacterAttackT = {
	name: string
	cost: Array<string>
	damage: number
	power: string | null
}

export type CharacterCardT = AnyCardT & {
	type: 'character'
	characterType: CharacterTypeT
	health: number
	primary: CharacterAttackT
	secondary: CharacterAttackT
}

export type CardInfoT = ItemCardT | EffectCardT | CharacterCardT | HealthCardT

export type CardTypesMapT = {
	character: CharacterCardT
	item: ItemCardT
	effect: EffectCardT
	single_use: EffectCardT
	health: HealthCardT
}
