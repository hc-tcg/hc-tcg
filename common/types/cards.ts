import {PlayerState, RowState, RowStateWithHermit} from './game-state'
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

export type EnergyT = HermitTypeT | 'any'

export type CardTypeT = 'item' | 'single_use' | 'effect' | 'hermit' | 'health'
export type BoardSlotTypeT = 'item' | 'effect' | 'hermit'
export type SlotTypeT = BoardSlotTypeT | 'single_use'

export type DamageT = {
	target?: number
	afkTarget?: number
	self?: number
}

export type HermitAttackInfo = {
	name: string
	cost: Array<EnergyT>
	damage: number
	power: string | null
}

export type CardDefs = {
	type: CardTypeT
	id: string
	name: string
	rarity: CardRarityT
	pickOn?: 'attack' | 'apply' | 'followup'
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
	pickOn?: 'attack' | 'apply' | 'followup'
	pickReqs?: Array<PickRequirmentT>
}

export type EffectDefs = {
	id: string
	name: string
	rarity: CardRarityT
	description: string
	pickOn?: 'attack' | 'apply' | 'followup'
	pickReqs?: Array<PickRequirmentT>
}

export type SingleUseDefs = {
	id: string
	name: string
	rarity: CardRarityT
	description: string
	pickOn?: 'attack' | 'apply' | 'followup'
	pickReqs?: Array<PickRequirmentT>
}

export type ItemDefs = {
	id: string
	name: string
	rarity: CardRarityT
	hermitType: HermitTypeT
}

export type Slot = {
	type: SlotTypeT
	index: number
}

export type BoardSlot = {
	type: BoardSlotTypeT
	index: number
}

export type CardPos = {
	player: PlayerState
	opponentPlayer: PlayerState
	rowIndex: number | null
	row: RowState | null
	slot: Slot
}

export type RowPos = {
	player: PlayerState
	rowIndex: number
	row: RowStateWithHermit
} | null

export type SlotPos = {
	rowIndex: number
	row: RowState
	slot: BoardSlot
}
