import adventOfTcgAttachCards from './advent-of-tcg/attach'
import adventOfTcgHermitCards from './advent-of-tcg/hermits'
import adventOfTcgSingleUseCards from './advent-of-tcg/single-use'
import defaultAttachCards from './attach'
import bossHermitCards from './boss/hermits'
import defaultHermitCards from './hermits'
import itemCards from './items'
import shifttechHermits from './shifttech/hermits'
import defaultSingleUseCards from './single-use'
import tempHermits from './temp'
import {Card} from './types'

export const attachCardClasses: Array<Card> = [
	...defaultAttachCards,
	...adventOfTcgAttachCards,
]

export const hermitCardClasses: Array<Card> = [
	...defaultHermitCards,
	...adventOfTcgHermitCards,
	...bossHermitCards,
	...tempHermits,
	...shifttechHermits,
]

export const itemCardClasses: Array<Card> = [...itemCards]

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
