import {PlayerState, RowState} from './game-state'
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

export type HermitAttackInfo = {
	name: string
	cost: Array<HermitTypeT | 'any'>
	damage: number
	power: string | null
}

export type CardDefs = {
	type: CardTypeT
	id: string
	name: string
	rarity: CardRarityT
	pickOn?: 'attack' | 'apply' | 'followup' | 'use-opponent' | 'use-ally'
	pickReqs?: Array<PickRequirmentT>
}

export type HermitDefs = {
	id: string
	name: string
	rarity: CardRarityT
	hermitType: HermitTypeT
	health: number
	primary: HermitAttackInfo
	secondary: HermitAttackInfo
	pickOn?: 'attack' | 'apply' | 'followup' | 'use-opponent' | 'use-ally'
	pickReqs?: Array<PickRequirmentT>
}

export type EffectDefs = {
	id: string
	name: string
	rarity: CardRarityT
	description: string
	pickOn?: 'attack' | 'apply' | 'followup' | 'use-opponent' | 'use-ally'
	pickReqs?: Array<PickRequirmentT>
}

export type SingleUseDefs = {
	id: string
	name: string
	rarity: CardRarityT
	description: string
	pickOn?: 'attack' | 'apply' | 'followup' | 'use-opponent' | 'use-ally'
	pickReqs?: Array<PickRequirmentT>
}

export type Slot = {
	type: SlotTypeT
	index: number
}

export type CardPos = {
	playerId: string
	player: PlayerState
	otherPlayerId: string
	otherPlayer: PlayerState
	rowIndex: number | null
	row: RowState | null
	slot: Slot
}
