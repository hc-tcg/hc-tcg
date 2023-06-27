import Card from '../cards/card-plugins/_card'
import {Slot} from './cards'
import {CardT, RowState} from './game-state'

export type SlotTypeT = 'item' | 'effect' | 'hermit' | 'health' | 'hand' | 'single_use'

export type SlotInfo = {
	type: SlotTypeT
	index: number
	card: CardT | null
	info: Card | null
}

export type RowInfo = {
	index: number
	state: RowState
}

export type PickRequirmentT = {
	target: 'player' | 'opponent' | 'board' | 'hand'
	type: Array<SlotTypeT>
	amount: number
	empty?: boolean
	active?: boolean
	breakIf?: Array<'active' | 'efficiency'>
	removable?: boolean
	adjacent?: 'req' | 'active'
}

export type PickedSlotT = {
	slot: SlotInfo
	row?: RowInfo
	playerId: string
}

export type PickProcessT = {
	name: string
	requirments: Array<PickRequirmentT>
	pickedSlots: Array<PickedSlotT>
	currentReq: number
	amount?: number
}

export type PickedSlots = Record<string, Array<PickedSlotT>>

export type PickResultT = {
	pickedSlots: Array<PickedSlotT>
	req: PickRequirmentT
}
