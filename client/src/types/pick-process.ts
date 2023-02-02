import {CardT} from 'types/game-state'

export type CardTypeT =
	| 'item'
	| 'single_use'
	| 'effect'
	| 'hermit'
	| 'health'
	| 'any'

export type PickRequirmentT = {
	target: 'player' | 'opponent' | 'hand'
	type: CardTypeT
	amount: number
	empty?: boolean
	active?: boolean
}

type PickedCardT = {
	card: CardT
	slotType: CardTypeT
	rowIndex?: number
	slowIndex?: number
	playerId?: string
}

export type PickProcessT = {
	id: string
	requirments: Array<PickRequirmentT>
	pickedCards: Array<PickedCardT>
}
