import Card from '../cards/card-plugins/_card'
import {CardT, RowState} from './game-state'

export type SlotTypeT =
	| 'item'
	| 'effect'
	| 'hermit'
	| 'health'
	| 'hand'
	| 'single_use'

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

export type BoardPickedSlotT = {
	slotType: 'item' | 'hermit' | 'effect' | 'health'
	card: CardT | null
	playerId: string
	rowIndex: number
	slotIndex: number
	rowHermitCard: CardT | null
}

export type HandPickedSlotT = {
	slotType: 'hand' | 'single_use'
	card: CardT | null
	playerId: string
}

export type PickedSlotT = BoardPickedSlotT | HandPickedSlotT

export type PickProcessT = {
	name: string
	requirments: Array<PickRequirmentT>
	pickedSlots: Array<PickedSlotT>
	currentReq: number
}

// @TODO this is a mess

export type BoardPickedSlotInfoProperties = {
	cardInfo: Card | null
	isActive: boolean
	row: RowState
}

export type BoardPickedSlotInfo = BoardPickedSlotT &
	BoardPickedSlotInfoProperties

export type HandPickedSlotInfoProperties = {
	cardInfo: Card | null
}

export type HandPickedSlotInfo = HandPickedSlotT & HandPickedSlotInfoProperties

export type PickedSlotInfo = BoardPickedSlotInfo | HandPickedSlotInfo

export type PickedSlotsInfo = Record<string, Array<PickedSlotInfo>>

export type PickResultT = {
	pickedSlots: Array<PickedSlotT>
	req: PickRequirmentT
}