import adventOfTcgAttachCards from './advent-of-tcg/attach'
import adventOfTcgHermitCards from './advent-of-tcg/hermits'
import adventOfTcgItemCards from './advent-of-tcg/items'
import adventOfTcgSingleUseCards from './advent-of-tcg/single-use'
import defaultAttachCards from './attach'
import bossHermitCards from './boss/hermits'
import defaultHermitCards from './hermits'
import defaultItemCards from './items'
import defaultSingleUseCards from './single-use'
import {Card} from './types'

export const attachCardClasses: Array<Card> = [
	...defaultAttachCards,
	...adventOfTcgAttachCards,
]

export const hermitCardClasses: Array<Card> = [
	...defaultHermitCards,
	...adventOfTcgHermitCards,
	...bossHermitCards,
]

export const itemCardClasses: Array<Card> = [
	...defaultItemCards,
	...adventOfTcgItemCards,
]

export const singleUseCardClasses: Array<Card> = [
	...defaultSingleUseCards,
	...adventOfTcgSingleUseCards,
]

const allCardClasses: Array<Card> = [
	...attachCardClasses,
	...hermitCardClasses,
	...itemCardClasses,
	...singleUseCardClasses,
]

export const CARDS: Record<string | number, Card> = allCardClasses.reduce(
	(result: Record<string | number, Card>, card) => {
		result[card.numericId] = card
		// To maintain compatability with the deck saving system, we need to be able to look up
		// cards by their id.
		result[card.id] = card
		return result
	},
	{},
)

export const CARDS_LIST = allCardClasses
