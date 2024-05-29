import Card from '../cards/base/card'
import {PlayerState, RowState, RowStateWithHermit} from './game-state'
import {PickInfo} from './server-requests'

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
	formattedPower?: Array<Node>
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
	player: PlayerState
	rowIndex: number
	row: RowState
	slot: BoardSlot
}

export type PlayCardLog = {
	player: string
	coinFlip: string
	header: string
	pos: {
		rowIndex: string
		id: string
		name: string
		hermitCard: string
		slotType: string
	}
	pick: {
		rowIndex: string
		id: string
		name: string
		slotType: string
	}
}
