import attachCardClasses from './attach'
import hermitCardClasses from './hermits'
import itemCardClasses from './items'
import singleUseCardClasses from './single-use'
import bossHermitCards from './boss/hermits'
import {Card} from './types'

const allCardClasses: Array<Card> = [
	...attachCardClasses,
	...hermitCardClasses,
	...bossHermitCards,
	...itemCardClasses,
	...singleUseCardClasses,
]

export const CARDS: Record<string | number, Card> = allCardClasses.reduce(
	(result: Record<string | string, Card>, card) => {
		result[card.numericId] = card
		// To maintain compatability with the deck saving system, we need to be able to look up
		// cards by their id.
		result[card.id] = card
		return result
	},
	{},
)

export const CARDS_LIST = allCardClasses
