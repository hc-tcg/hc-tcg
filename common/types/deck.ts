import {CardT} from './game-state'

export type PlayerDeckT = {
	name: string
	icon:
		| 'any'
		| 'bacon'
		| 'bot'
		| 'iceCream'
		| 'minecraft'
		| 'toddler'
		| 'australian'
		| 'cat'

	cards: Array<CardT>
}
