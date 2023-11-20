import {PlayerState, RowState, RowStateWithHermit} from './game-state'

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
export type BoardSlotTypeT = 'item' | 'effect' | 'hermit' | 'health'
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

export type Slot = {
	type: SlotTypeT
	index: number
}

export type BoardSlot = {
	type: BoardSlotTypeT
	index: number
}

export type RowPos = {
	player: PlayerState
	rowIndex: number
	row: RowStateWithHermit
}

export type SlotPos = {
	rowIndex: number
	row: RowState
	slot: BoardSlot
}
