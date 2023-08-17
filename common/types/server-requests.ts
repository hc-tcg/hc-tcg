import {ActionResult, CardT} from './game-state'

export type PickedSlotType = 'item' | 'effect' | 'hermit' | 'hand'

export type PickedSlot = {
	type: PickedSlotType
	index: number
}

export type PickResult = {
	playerId: string
	rowIndex?: number // This will be undefined for the hand
	card: CardT | null
	slot: PickedSlot
}

export type PickRequest = {
	id?: string
	message: string // The message to display to the player
	onResult: (pickResult: PickResult) => ActionResult // The function that will be called when we receive the pick result
	onTimeout: () => void // Called when the request times out before being resolved successfully
}

// @TODO this is a quick and dirty way to get modals working
export type ModalRequest = {
	id: string
	onResult: (modalResult: any) => ActionResult // The function that will be called when we receive the modal result
	onTimeout: () => void // Called when the request times out before being resolved successfully
}
