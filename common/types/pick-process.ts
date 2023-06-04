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

// @TODO this is a mess

export type BoardPickedCardInfoProperties = {
	cardInfo: Card | null
	isActive: boolean
	row: RowState
}

export type BoardPickedCardInfo = BoardPickedCardT &
	BoardPickedCardInfoProperties

export type HandPickedCardInfoProperties = {
	cardInfo: Card | null
}

export type HandPickedCardInfo = HandPickedCardT & HandPickedCardInfoProperties

export type PickedCardInfo = BoardPickedCardInfo | HandPickedCardInfo

export type PickedCardsInfo = Record<string, Array<PickedCardInfo>>
