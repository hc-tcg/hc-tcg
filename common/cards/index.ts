import adventOfTcgEffectCards from './advent-of-tcg/attach'
import adventOfTcgHermitCards from './advent-of-tcg/hermits'
import adventOfTcgItemCards from './advent-of-tcg/items'
import adventOfTcgSingleUseCards from './advent-of-tcg/single-use'
import {Card} from './types'
import bossHermitCards from './boss/hermits'
import defaultEffectCards from './attach'
import defaultHermitCards from './hermits'
import defaultItemCards from './items'
import defaultSingleUseCards from './single-use'

const attachCardClasses: Array<Card> = [
	...defaultEffectCards,
	...adventOfTcgEffectCards,
]

const hermitCardClasses: Array<Card> = [
	...defaultHermitCards,
	...adventOfTcgHermitCards,
	...bossHermitCards,
]

const itemCardClasses: Array<Card> = [
	...defaultItemCards,
	...adventOfTcgItemCards,
]

const singleUseCardClasses: Array<Card> = [
	...defaultSingleUseCards,
	...adventOfTcgSingleUseCards,
]

const allCardClasses: Array<Card> = [
	...attachCardClasses,
	...hermitCardClasses,
	...bossHermitCards,
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
