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
}

export type PickProcessT = {
	requirments: Array<PickRequirmentT>
	pickedCards: Array<CardT>
}
