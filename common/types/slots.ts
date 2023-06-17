import {RowState} from './game-state'

export type SlotTypeT = 'item' | 'effect' | 'hermit'

export type SlotPos = {
	row: RowState
	index: number
	type: SlotTypeT
}
