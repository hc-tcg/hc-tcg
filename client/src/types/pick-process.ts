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

export type PickedCardT =
	| {
			slotType: 'single_use' | 'hand'
			card: CardT | null
			playerId: string
	  }
	| {
			slotType: 'item' | 'hermit' | 'effect' | 'health'
			card: CardT | null
			playerId: string
			rowIndex: number
			slotIndex: number
			rowHermitCard: CardT | null
	  }

export type PickProcessT = {
	name: string
	requirments: Array<PickRequirmentT>
	pickedCards: Array<PickedCardT>
	currentReq: number
}
