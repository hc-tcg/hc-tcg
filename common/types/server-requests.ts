import {SlotTypeT} from './cards'
import {ActionResult, CardT, ModalData} from './game-state'

export type PickedSlotType = SlotTypeT | 'hand'

export type SlotInfo = {
	type: PickedSlotType
	index: number
}

export type PickInfo = {
	playerId: string
	rowIndex?: number // This will be undefined for the hand
	card: CardT | null
	slot: SlotInfo
}

export type PickRequest = {
	/** The id of the player to request the pick from */
	playerId: string
	/** The id of the card that called the pick request */
	id: string
	/** The message to display to the player */
	message: string
	/** The function that will be called when we receive a pick result. This will return whether this was a success or not*/
	onResult: (pickResult: PickInfo) => ActionResult //
	/** Called when the pick request is cancelled. This can only occur with a single use card */
	onCancel?: () => void
	/** Called when the pick request times out before being resolved successfully */
	onTimeout?: () => void
}

export type ModalRequest = {
	/** The id of the player to request the pick from */
	playerId: string
	/** The id of the custom modal, used to reference it at a later date */
	data: ModalData
	/** The function that will be called when we receive a modal result. This will return whether this was a success or not*/
	onResult: (modalResult: any) => ActionResult
	/** Called when the modal request times out before being resolved successfully */
	onTimeout: () => void
}
