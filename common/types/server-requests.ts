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
	/** The id of the player to request the pick from */
	playerId: string
	/** The id of the card that called the pick request */
	id: string
	/** The message to display to the player */
	message: string
	/** The function that will be called when we receive a pick result. This will return whether this was a success or not*/
	onResult: (pickResult: PickResult) => ActionResult //
	/** Called when the pick request is cancelled. This can only occur with a single use card */
	onCancel?: () => void
	/** Called when the pick request times out before being resolved successfully */
	onTimeout?: () => void
}

export type ModalRequest = {
	/** The id of the player to request the pick from */
	playerId: string
	/** The id of the custom modal, used to reference it at a later date */
	id: string
	/** The function that will be called when we receive a modal result. This will return whether this was a success or not*/
	onResult: (modalResult: any) => ActionResult
	/** Called when the modal request times out before being resolved successfully */
	onTimeout: () => void
}
