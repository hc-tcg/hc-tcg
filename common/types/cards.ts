import {Ailment} from './game-state'
import {PickRequirmentT} from './pick-process'

export type CardRarityT = 'common' | 'rare' | 'ultra_rare'

export type RankT = {
	name: string
	cost: number
}

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

export type CardTypeT = 'item' | 'single_use' | 'effect' | 'hermit' | 'health'
export type SlotTypeT = 'item' | 'single_use' | 'effect' | 'hermit'

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

export type HermitAttackT = {
	name: string
	cost: Array<string>
	damage: number
	power: string | null
}

export type CardDefs = {
	type: CardTypeT
	id: string
	name: string
	rarity: CardRarityT
}

export type EffectDefs = {
	id: string
	name: string
	rarity: CardRarityT
	description: string
}

export type Slot = {
	type: SlotTypeT
	index: number
}

export type CardPos = {
	playerId: string
	playerState: PlayerState
	rowIndex: number | null
	rowState: RowState | null
	slotType: SlotTypeT
}
