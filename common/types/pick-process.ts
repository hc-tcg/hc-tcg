import {CardT} from './game-state'

export type SlotTypeT =
	| 'item'
	| 'effect'
	| 'hermit'
	| 'health'
	| 'hand'
	| 'single_use'

export type PickRequirmentT = {
	target: 'player' | 'opponent' | 'hand'
	type: SlotTypeT | 'any'
	amount: number
	empty?: boolean
	active?: boolean
	breakIf?: Array<'active' | 'efficiency'>
}

export type BoardPickedCardT = {
	slotType: 'item' | 'hermit' | 'effect' | 'health'
	card: CardT | null
	playerId: string
	rowIndex: number
	slotIndex: number
	rowHermitCard: CardT | null
}

export type HandPickedCardT = {
	slotType: 'hand' | 'single_use'
	card: CardT | null
	playerId: string
}

export type PickedCardT = BoardPickedCardT | HandPickedCardT

export type PickProcessT = {
	name: string
	requirments: Array<PickRequirmentT>
	pickedCards: Array<PickedCardT>
	currentReq: number
}
